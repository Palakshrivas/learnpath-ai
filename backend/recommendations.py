from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import get_current_user_id
from app.recommender import generate_path, get_course
from app.serializers import serialize_item, progress_map
from app.llm import answer_question

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def _get_active_path(db: Session, user_id: str) -> models.LearningPath:
    path = (
        db.query(models.LearningPath)
        .filter(models.LearningPath.user_id == user_id, models.LearningPath.is_active.is_(True))
        .first()
    )
    if not path:
        raise HTTPException(status_code=404, detail="No active path yet — generate one first")
    return path


@router.post("/generate", response_model=schemas.LearningPathOut)
def generate(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    profile = db.query(models.LearnerProfile).filter(models.LearnerProfile.user_id == user_id).first()
    if not profile or not profile.domain or not profile.experience_level:
        raise HTTPException(status_code=400, detail="Finish chat onboarding before generating a path")

    db.query(models.LearningPath).filter(
        models.LearningPath.user_id == user_id, models.LearningPath.is_active.is_(True)
    ).update({"is_active": False})

    path = models.LearningPath(user_id=user_id, domain=profile.domain, level=profile.experience_level)
    db.add(path)
    db.commit()
    db.refresh(path)

    for c in generate_path(profile.domain, profile.experience_level):
        db.add(models.PathItem(
            path_id=path.id, course_id=c["id"], order_index=c["order"],
            is_milestone=c["is_milestone"], reason=c["reason"],
        ))
    db.commit()
    db.refresh(path)

    pmap = progress_map(db, user_id)
    items = [serialize_item(i, pmap.get(i.course_id, "not_started")) for i in path.items]
    return schemas.LearningPathOut(id=path.id, domain=path.domain, level=path.level, items=items)


@router.get("/path", response_model=schemas.LearningPathOut)
def get_active_path(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    path = _get_active_path(db, user_id)
    pmap = progress_map(db, user_id)
    items = [serialize_item(i, pmap.get(i.course_id, "not_started")) for i in path.items]
    return schemas.LearningPathOut(id=path.id, domain=path.domain, level=path.level, items=items)


@router.post("/explain/{course_id}")
def explain_course(
    course_id: str,
    query: schemas.ExplainQuery,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Grounded Q&A: builds real context from Postgres, then asks the LLM to answer from it only."""
    path = _get_active_path(db, user_id)
    item = next((i for i in path.items if i.course_id == course_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Course not found in your active path")

    course = get_course(course_id) or {}
    profile = db.query(models.LearnerProfile).filter(models.LearnerProfile.user_id == user_id).first()

    context = {
        "course": {"title": course.get("title"), "skills": course.get("skills"), "hours": course.get("hours")},
        "step": f"{item.order_index + 1} of {len(path.items)}",
        "rule_based_reason": item.reason,
        "learner_goal": profile.goal_text if profile else None,
        "learner_level": profile.experience_level if profile else None,
    }

    question = query.question or "Why is this course recommended for me?"
    answer = answer_question(question, context)
    return {"course_id": course_id, "answer": answer}
