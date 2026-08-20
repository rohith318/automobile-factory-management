from pydantic import BaseModel, ConfigDict


class PayrollBase(BaseModel):
    worker_id: int
    basic_salary: float
    overtime_amount: float = 0
    deductions: float = 0
    final_salary: float
    payment_status: str = "PENDING"


class PayrollCreate(PayrollBase):
    pass


class PayrollResponse(PayrollBase):
    id: int

    model_config = ConfigDict(from_attributes=True)