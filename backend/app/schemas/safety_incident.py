from datetime import date

from pydantic import BaseModel, ConfigDict


class SafetyIncidentBase(BaseModel):
    worker_id: int
    incident_type: str
    incident_date: date
    severity: str
    remarks: str | None = None


class SafetyIncidentCreate(SafetyIncidentBase):
    pass


class SafetyIncidentResponse(SafetyIncidentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)