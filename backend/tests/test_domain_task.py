from datetime import datetime, timezone

from app.domain.models import Task


def test_mark_done_sets_status_and_completed_at():
    task = Task(user_id=1, title="Test")
    assert task.status == "todo"
    assert task.completed_at is None

    fixed_now = datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    task.mark_done(now=fixed_now)

    assert task.status == "done"
    assert task.completed_at == fixed_now
    assert task.updated_at == fixed_now


def test_init_done_sets_completed_at_automatically():
    task = Task(user_id=2, title="Already done", status="done")
    assert task.status == "done"
    assert task.completed_at is not None
    assert task.completed_at.tzinfo is not None  # ensure timezone-aware


