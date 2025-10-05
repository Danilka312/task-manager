from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    time: str  # ISO-8601 UTC string


app = FastAPI()


@app.get("/healthz", response_model=HealthResponse)
def healthz() -> HealthResponse:
    current_time_utc_iso = datetime.now(timezone.utc).isoformat()
    return HealthResponse(status="ok", time=current_time_utc_iso)



