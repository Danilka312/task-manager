from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def register_and_login(email: str = "ana@example.com", password: str = "secret123") -> str:
    client.post("/api/auth/register", json={"email": email, "password": password})
    r = client.post("/api/auth/login", data={"username": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access"]


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def test_analytics_summary_counts():
    token = register_and_login()

    today = date.today()
    yesterday = today - timedelta(days=1)
    tomorrow = today + timedelta(days=1)

    # 1) todo today
    client.post("/api/tasks/", json={"title": "t1", "due_date": today.isoformat(), "priority": "medium"}, headers=auth_headers(token))
    # 2) in_progress tomorrow
    r = client.post("/api/tasks/", json={"title": "t2", "due_date": tomorrow.isoformat(), "priority": "low"}, headers=auth_headers(token))
    task2_id = r.json()["id"]
    client.patch(f"/api/tasks/{task2_id}", json={"status": "in_progress"}, headers=auth_headers(token))
    # 3) done yesterday
    r = client.post("/api/tasks/", json={"title": "t3", "due_date": yesterday.isoformat(), "priority": "high"}, headers=auth_headers(token))
    task3_id = r.json()["id"]
    client.patch(f"/api/tasks/{task3_id}", json={"status": "done"}, headers=auth_headers(token))
    # 4) overdue todo yesterday
    client.post("/api/tasks/", json={"title": "t4", "due_date": yesterday.isoformat(), "priority": "urgent"}, headers=auth_headers(token))

    # summary
    resp = client.get("/api/analytics/summary", headers=auth_headers(token))
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data == {"active": 2, "done": 1, "overdue": 1}


