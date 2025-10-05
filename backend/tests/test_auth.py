from fastapi.testclient import TestClient
from app.main import app
from app.infra.db import Base, engine
from uuid import uuid4


Base.metadata.create_all(bind=engine)
client = TestClient(app)


def test_register_returns_tokens_and_me_works():
    email = f"newuser_{uuid4().hex[:6]}@example.com"
    password = "secret123"
    full_name = "New User"

    # register
    r = client.post("/api/auth/register", json={"email": email, "password": password, "full_name": full_name})
    assert r.status_code == 201, r.text
    data = r.json()
    assert "access" in data and data["access"]
    assert "refresh" in data and data["refresh"]

    access = data["access"]

    # me with access token
    r_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {access}"})
    assert r_me.status_code == 200, r_me.text
    me = r_me.json()
    assert me["email"] == email
    assert me.get("full_name") == full_name


def test_register_duplicate_email_returns_email_taken():
    email = f"dupe_{uuid4().hex[:6]}@example.com"
    password = "secret123"

    # first time
    r1 = client.post("/api/auth/register", json={"email": email, "password": password})
    assert r1.status_code == 201, r1.text

    # second time -> 400 email_taken
    r2 = client.post("/api/auth/register", json={"email": email, "password": password})
    assert r2.status_code == 400, r2.text
    assert r2.json().get("detail") == "email_taken"
