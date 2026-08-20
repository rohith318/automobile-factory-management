from datetime import date

from pydantic import BaseModel, ConfigDict


class MaintenanceBase(BaseModel):
    machine_id: int | None = None
    robot_id: int | None = None
    maintenance_type: str
    maintenance_cost: float = 0
    maintenance_date: date
    technician_name: str
    remarks: str | None = None


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceResponse(MaintenanceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)