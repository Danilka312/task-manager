# backend/app/api/analytics.py
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import func, select, or_
from sqlalchemy.orm import Session
from app.auth.deps import get_current_user
from app.infra.db import get_db
from app.infra.models import TaskORM, UserORM

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
def summary(db: Session = Depends(get_db), user: UserORM = Depends(get_current_user)):
    today = date.today()

    # overdue: просроченные и не done
    overdue_q = select(func.count()).select_from(TaskORM).where(
        TaskORM.user_id == user.id,
        TaskORM.status != "done",
        TaskORM.due_date.is_not(None),
        TaskORM.due_date < today,
    )
    overdue = db.scalar(overdue_q)

    # done: завершённые
    done_q = select(func.count()).select_from(TaskORM).where(
        TaskORM.user_id == user.id,
        TaskORM.status == "done",
    )
    done = db.scalar(done_q)

    # active: todo|in_progress, НО не просроченные
    active_q = select(func.count()).select_from(TaskORM).where(
        TaskORM.user_id == user.id,
        TaskORM.status.in_(["todo", "in_progress"]),
        or_(TaskORM.due_date.is_(None), TaskORM.due_date >= today),  # исключаем просрочку
    )
    active = db.scalar(active_q)

    return {"active": int(active or 0), "done": int(done or 0), "overdue": int(overdue or 0)}
