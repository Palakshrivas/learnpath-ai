import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import get_current_user_id
from app.llm import extract_profile
from app.recommender import DOMAINS
from app.routes.profile import get_or_create_profile

router = APIRouter(prefix="/chat", tags=["chat"])


def _log(db: Session, user_id: str, role: str, content: str) -> None:
    db.add(models.ChatMessage(user_id=user_id, role=role, content=content))
    db.commit()


@router.get("/history", response_model=list[schemas.ChatMessageOut])
def history(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == user_id)
        .order_by(models.ChatMessage.created_at)
        .all()
    )
    return [schemas.ChatMessageOut(role=r.role, text=r.content) for r in rows]


@router.post("/message", response_model=schemas.ChatMessageOut)
def send_message(
    payload: schemas.ChatMessageIn,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    _log(db, user_id, "user", payload.text)
    profile = get_or_create_profile(db, user_id)

    prior = f"Earlier the learner said: {profile.goal_text}" if profile.goal_text else None
    extracted = extract_profile(payload.text, prior_context=prior)

    if extracted["domain"] != "unclear":
        profile.domain = extracted["domain"]
    profile.goal_text = (
        f"{profile.goal_text} {payload.text}" if profile.goal_text else (extracted.get("goal_summary") or payload.text)
    )
    if extracted["experience_level"] != "unknown":
        profile.experience_level = extracted["experience_level"]
    if extracted.get("interests"):
        profile.interests = json.dumps(extracted["interests"])
    if extracted.get("weekly_hours"):
        profile.weekly_hours = extracted["weekly_hours"]
    db.commit()

    ready = bool(profile.domain and profile.experience_level)

    if ready:
        reply = (
            f"Got it — a {DOMAINS[profile.domain]['label']} path at {profile.experience_level} level. "
            "Ready to generate your route whenever you are."
        )
    elif extracted.get("follow_up_question"):
        reply = extracted["follow_up_question"]
    else:
        reply = "Tell me a bit more about what you're aiming for."

    _log(db, user_id, "guide", reply)
    return schemas.ChatMessageOut(role="guide", text=reply, ready_to_generate=ready)
