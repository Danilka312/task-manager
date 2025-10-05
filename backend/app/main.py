from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.tasks import router as tasks_router

app = FastAPI(title="Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}

app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router)  # у нас уже prefix="/api/tasks"
