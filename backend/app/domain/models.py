from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, model_validator


# Enums via typing.Literal (string literal types)
TaskStatus = Literal["todo", "in_progress", "done"]
Priority = Literal["low", "medium", "high", "urgent"]


class Task(BaseModel):
    id: int | None = None
    user_id: int
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None
    priority: Priority = "medium"
    status: TaskStatus = "todo"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None

    def mark_done(self, now: datetime | None = None) -> None:
        now = now or datetime.now(timezone.utc)
        self.status = "done"
        self.completed_at = now
        self.updated_at = now

    @model_validator(mode="after")
    def _ensure_completed_when_done(self) -> "Task":
        # If instantiated as done without a completed_at, set it automatically.
        if self.status == "done" and self.completed_at is None:
            self.completed_at = datetime.now(timezone.utc)
        return self


