from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.infra.db import get_db
from app.auth.deps import get_current_user
from app.infra.models import TaskORM, UserORM
from app.schemas.tasks import TaskCreate, TaskUpdate, TaskRead, TaskList
from app.repo.tasks import create_task, get_task, list_tasks, update_task, delete_task


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create(data: TaskCreate, db: Session = Depends(get_db), user: UserORM = Depends(get_current_user)):
    return create_task(db, user.id, data)


@router.get("/", response_model=TaskList)
def list_endpoint(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    due_from: Optional[date] = Query(None),
    due_to: Optional[date] = Query(None),
    sort: Optional[str] = Query("created_at"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: UserORM = Depends(get_current_user),
):
    items, total = list_tasks(
        db,
        user.id,
        status=status,
        priority=priority,
        q=q,
        due_from=due_from,
        due_to=due_to,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    return TaskList(items=items, total=total, page=page, page_size=page_size)


@router.get("/{task_id}", response_model=TaskRead)
def get_one(task_id: int, db: Session=Depends(get_db), user: UserORM=Depends(get_current_user)):
    task = get_task(db, user.id, task_id)
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def patch(task_id: int, data: TaskUpdate, db: Session=Depends(get_db), user: UserORM=Depends(get_current_user)):
    task = update_task(db, user.id, task_id, data)
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=204)
def remove(task_id: int, db: Session=Depends(get_db), user: UserORM=Depends(get_current_user)):
    ok = delete_task(db, user.id, task_id)
    if not ok: raise HTTPException(status_code=404, detail="Task not found")
    return None


