from typing import Optional, Tuple, List
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, select, or_, asc, desc
from app.infra.models import TaskORM


def create_task(db: Session, user_id: int, data) -> TaskORM:
    now = datetime.now(timezone.utc)
    task = TaskORM(
        user_id=user_id,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        priority=data.priority or "medium",
        status="todo",
        created_at=now,          # <-- добавили
        updated_at=now,          # <-- добавили
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, user_id: int, task_id: int) -> Optional[TaskORM]:
    return db.get(TaskORM, task_id) if (t:=db.get(TaskORM, task_id)) and t.user_id==user_id else None


def list_tasks(
    db: Session,
    user_id: int,
    *,
    status=None,
    priority=None,
    q=None,
    due_from: Optional[date] = None,
    due_to: Optional[date] = None,
    sort: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[TaskORM], int]:
    stmt = select(TaskORM).where(TaskORM.user_id == user_id)
    if status:
        stmt = stmt.where(TaskORM.status == status)
    if priority:
        stmt = stmt.where(TaskORM.priority == priority)
    if q:
        qv = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(TaskORM.title).like(qv),
                func.lower(TaskORM.description).like(qv),
            )
        )
    if due_from:
        stmt = stmt.where(TaskORM.due_date >= due_from)
    if due_to:
        stmt = stmt.where(TaskORM.due_date <= due_to)

    total = db.execute(stmt.with_only_columns(func.count())).scalar_one()

    # Sorting: default created_at desc; when 'due_date' use ascending
    if sort == 'due_date':
        order_clause = asc(TaskORM.due_date)
    else:
        order_clause = desc(TaskORM.created_at)

    items = (
        db.execute(
            stmt.order_by(order_clause).offset((page - 1) * page_size).limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def update_task(db: Session, user_id:int, task_id:int, data) -> Optional[TaskORM]:
    task = db.get(TaskORM, task_id)
    if not task or task.user_id != user_id: return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
        if field=="status" and value=="done":
            task.completed_at = datetime.now(timezone.utc)
    db.commit(); db.refresh(task)
    return task


def delete_task(db: Session, user_id:int, task_id:int) -> bool:
    task = db.get(TaskORM, task_id)
    if not task or task.user_id != user_id: return False
    db.delete(task); db.commit()
    return True


