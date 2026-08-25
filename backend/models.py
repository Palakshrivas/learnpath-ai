from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base

# NOTE: There is deliberately no User model here. Java's auth service
# owns users/passwords/sessions. This service only ever sees a
# user_id string (pulled from the verified JWT) and stores its own
# data — profile, chat log, paths, progress, feedback — against it.
# No cross-service foreign key; that's normal for two services that
# happen to share one Postgres instance but own separate tables.


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    goal_text = Column(Text, nullable=True)
    domain = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)  # beginner | intermediate | advanced
    interests = Column(Text, nullable=True)            # JSON-encoded list of strings
    weekly_hours = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False)  # "user" | "guide"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LearningPath(Base):
    __tablename__ = "learning_paths"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    domain = Column(String, nullable=False)
    level = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship(
        "PathItem", back_populates="path",
        order_by="PathItem.order_index", cascade="all, delete-orphan",
    )


class PathItem(Base):
    __tablename__ = "path_items"
    id = Column(Integer, primary_key=True, index=True)
    path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    course_id = Column(String, nullable=False)  # references the course catalog in recommender.py
    order_index = Column(Integer, nullable=False)
    is_milestone = Column(Boolean, default=False)
    reason = Column(Text, nullable=True)

    path = relationship("LearningPath", back_populates="items")


class Progress(Base):
    __tablename__ = "progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    course_id = Column(String, nullable=False)
    status = Column(String, default="not_started")  # not_started | in_progress | completed
    completed_at = Column(DateTime, nullable=True)


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    course_id = Column(String, nullable=False)
    rating = Column(String, nullable=False)  # too_easy | just_right | too_hard
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
