from datetime import date, datetime
from typing import Optional, Literal, List
from pydantic import BaseModel, Field, ConfigDict

Priority = Literal["low","medium","high","urgent"]
Status   = Literal["todo","in_progress","done"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[Priority] = "medium"


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None


class TaskRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[date]
    priority: Priority
    status: Status
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class TaskList(BaseModel):
    items: List[TaskRead]
    total: int
    page: int
    page_size: int


