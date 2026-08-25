from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import get_current_user_id
from app.recommender import regenerate_after_feedback
from app.serializers import serialize_item, progress_map

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=schemas.LearningPathOut)
def submit_feedback(
    payload: schemas.FeedbackIn,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    db.add(models.Feedback(user_id=user_id, course_id=payload.course_id, rating=payload.rating, comment=payload.comment))
    db.commit()

    path = (
        db.query(models.LearningPath)
        .filter(models.LearningPath.user_id == user_id, models.LearningPath.is_active.is_(True))
        .first()
    )
    if not path:
        raise HTTPException(status_code=404, detail="No active path yet")

    feedback_rows = db.query(models.Feedback).filter(models.Feedback.user_id == user_id).all()
    feedback_map = {f.course_id: f.rating for f in feedback_rows}

    completed_ids = {
        r.course_id for r in db.query(models.Progress).filter(
            models.Progress.user_id == user_id, models.Progress.status == "completed"
        ).all()
    }

    new_courses = regenerate_after_feedback(path.domain, path.level, feedback_map)
    remaining = [c for c in new_courses if c["id"] not in completed_ids]

    if completed_ids:
        db.query(models.PathItem).filter(
            models.PathItem.path_id == path.id,
            models.PathItem.course_id.notin_(list(completed_ids)),
        ).delete(synchronize_session=False)
    else:
        db.query(models.PathItem).filter(models.PathItem.path_id == path.id).delete(synchronize_session=False)

    keep_count = db.query(models.PathItem).filter(models.PathItem.path_id == path.id).count()
    for i, c in enumerate(remaining):
        db.add(models.PathItem(
            path_id=path.id, course_id=c["id"], order_index=keep_count + i,
            is_milestone=c["is_milestone"], reason=c["reason"] + " (updated after your feedback)",
        ))
    db.commit()
    db.refresh(path)

    pmap = progress_map(db, user_id)
    items = [serialize_item(i, pmap.get(i.course_id, "not_started")) for i in path.items]
    return schemas.LearningPathOut(id=path.id, domain=path.domain, level=path.level, items=items)
