import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import get_current_user_id

router = APIRouter(prefix="/profile", tags=["profile"])


def get_or_create_profile(db: Session, user_id: str) -> models.LearnerProfile:
    profile = db.query(models.LearnerProfile).filter(models.LearnerProfile.user_id == user_id).first()
    if not profile:
        profile = models.LearnerProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=schemas.ProfileOut)
def read_profile(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    return schemas.ProfileOut(
        domain=profile.domain,
        experience_level=profile.experience_level,
        goal_text=profile.goal_text,
        interests=json.loads(profile.interests) if profile.interests else [],
        weekly_hours=profile.weekly_hours,
    )
