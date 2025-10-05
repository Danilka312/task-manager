from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Date, Enum, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.infra.db import Base


TaskStatusEnum = ("todo", "in_progress", "done")
PriorityEnum = ("low", "medium", "high", "urgent")


class UserORM(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(320), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    tasks = relationship("TaskORM", back_populates="user", cascade="all,delete-orphan")


class TaskORM(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    priority = Column(Enum(*PriorityEnum, name="priority_enum"), default="medium", nullable=False)
    status = Column(Enum(*TaskStatusEnum, name="status_enum"), default="todo", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("UserORM", back_populates="tasks")


Index("ix_tasks_status", TaskORM.status)
Index("ix_tasks_due_date", TaskORM.due_date)


