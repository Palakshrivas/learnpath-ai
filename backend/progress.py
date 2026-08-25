from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import get_current_user_id
from app.recommender import get_course, skill_gap_summary

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/update", response_model=schemas.ProgressUpdate)
def update_progress(
    payload: schemas.ProgressUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    record = (
        db.query(models.Progress)
        .filter(models.Progress.user_id == user_id, models.Progress.course_id == payload.course_id)
        .first()
    )
    if not record:
        record = models.Progress(user_id=user_id, course_id=payload.course_id)
        db.add(record)

    record.status = payload.status
    record.completed_at = datetime.utcnow() if payload.status == "completed" else None
    db.commit()
    return payload


@router.get("/dashboard", response_model=schemas.DashboardOut)
def dashboard(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    path = (
        db.query(models.LearningPath)
        .filter(models.LearningPath.user_id == user_id, models.LearningPath.is_active.is_(True))
        .first()
    )
    if not path:
        raise HTTPException(status_code=404, detail="No active path yet — generate one first")

    records = db.query(models.Progress).filter(models.Progress.user_id == user_id).all()
    completed_ids = {r.course_id for r in records if r.status == "completed"}
    pmap = {r.course_id: r.status for r in records}

    path_items = []
    for item in path.items:
        course = get_course(item.course_id) or {}
        path_items.append({**course, "order": item.order_index, "reason": item.reason, "is_milestone": item.is_milestone})

    total = len(path_items)
    done = len([c for c in path_items if c["id"] in completed_ids])
    percent = round((done / total) * 100) if total else 0
    remaining = [c for c in path_items if c["id"] not in completed_ids]
    hours_remaining = sum(c["hours"] for c in remaining)

    next_actions = [
        schemas.PathItemOut(
            id=c["id"], title=c["title"], domain=c["domain"], skills=c["skills"], prereqs=c["prereqs"],
            difficulty=c["difficulty"], hours=c["hours"], desc=c["desc"], is_milestone=c["is_milestone"],
            milestone_note=c.get("milestone_note"), order=c["order"], reason=c["reason"],
            status=pmap.get(c["id"], "not_started"),
        )
        for c in remaining[:3]
    ]
    next_milestone = next((c["title"] for c in remaining if c["is_milestone"]), None)
    skills = skill_gap_summary(path.domain, path_items, completed_ids)

    return schemas.DashboardOut(
        percent_complete=percent, hours_remaining=hours_remaining, completed_count=done, total_count=total,
        next_actions=next_actions, skills=[schemas.DashboardSkill(**s) for s in skills], next_milestone=next_milestone,
    )
