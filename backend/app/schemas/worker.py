from datetime import date

from pydantic import BaseModel, ConfigDict


class WorkerBase(BaseModel):
    employee_code: str
    full_name: str
    department_id: int
    designation: str
    phone: str
    address: str
    joining_date: date
    salary: float
    shift_type: str
    status: str = "ACTIVE"


class WorkerCreate(WorkerBase):
    pass


class WorkerResponse(WorkerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)