from pydantic import BaseModel, Field


class IoTData(BaseModel):
    machine_id: int
    temperature: float = Field(..., ge=0)
    vibration: float = Field(..., ge=0)
    rpm: float = Field(..., ge=0)
    power_usage: float = Field(..., ge=0)
    machine_status: str = "OPERATIONAL"


class IoTResponse(IoTData):
    risk_level: str
    alert: str | None = None