from datetime import date

from pydantic import BaseModel, ConfigDict


class InventoryTransactionBase(BaseModel):
    material_id: int
    transaction_type: str
    quantity: float
    transaction_date: date


class InventoryTransactionCreate(InventoryTransactionBase):
    pass


class InventoryTransactionResponse(InventoryTransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)