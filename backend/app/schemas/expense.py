from datetime import date

from pydantic import BaseModel, ConfigDict


class ExpenseBase(BaseModel):
    expense_type: str
    amount: float
    expense_date: date
    remarks: str | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)