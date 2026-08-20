from pydantic import BaseModel, ConfigDict


class WarehouseBase(BaseModel):
    warehouse_name: str
    location: str
    capacity: float


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseResponse(WarehouseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)