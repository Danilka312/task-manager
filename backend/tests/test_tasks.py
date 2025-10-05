from datetime import date
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def register_and_login(email: str = "user@example.com", password: str = "secret123") -> str:
    # register (idempotent-ish)
    client.post("/api/auth/register", json={"email": email, "password": password})
    # login
    r = client.post("/api/auth/login", data={"username": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access"]


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def test_tasks_crud_flow():
    token = register_and_login()

    # create
    create_payload = {
        "title": "My task",
        "description": "desc",
        "due_date": date.today().isoformat(),
        "priority": "high",
    }
    r = client.post("/api/tasks/", json=create_payload, headers=auth_headers(token))
    assert r.status_code == 201, r.text
    task = r.json()
    task_id = task["id"]
    assert task["title"] == "My task"
    assert task["priority"] == "high"
    assert task["status"] == "todo"

    # list
    r = client.get("/api/tasks/", headers=auth_headers(token))
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 1
    assert any(it["id"] == task_id for it in data["items"])  # type: ignore[index]

    # patch - mark done
    r = client.patch(f"/api/tasks/{task_id}", json={"status": "done"}, headers=auth_headers(token))
    assert r.status_code == 200
    updated = r.json()
    assert updated["status"] == "done"
    assert updated["completed_at"] is not None

    # delete
    r = client.delete(f"/api/tasks/{task_id}", headers=auth_headers(token))
    assert r.status_code == 204

    # get after delete -> 404
    r = client.get(f"/api/tasks/{task_id}", headers=auth_headers(token))
    assert r.status_code == 404


