from datetime import date

from pydantic import BaseModel, ConfigDict


# =========================================================
# BASE SCHEMA
# =========================================================

class MachineryBase(BaseModel):

    machine_code: str

    machine_name: str

    machine_type: str

    department_id: int

    purchase_date: date

    warranty_expiry: date | None = None

    machine_status: str = "OPERATIONAL"

    running_hours: float = 0


# =========================================================
# CREATE
# =========================================================

class MachineryCreate(MachineryBase):
    pass


# =========================================================
# RESPONSE
# =========================================================

class MachineryResponse(MachineryBase):

    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# MONITORING UPDATE
# =========================================================

class MachineryMonitoringUpdate(BaseModel):

    machine_status: str

    running_hours: float