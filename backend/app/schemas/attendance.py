from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AttendanceBase(BaseModel):
    worker_id: int
    attendance_date: date
    check_in: datetime | None = None
    check_out: datetime | None = None
    overtime_hours: float = 0


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)