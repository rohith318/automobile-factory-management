from pydantic import BaseModel, ConfigDict


class RawMaterialBase(BaseModel):
    material_code: str
    material_name: str
    stock_quantity: float = 0
    unit_price: float = 0
    supplier_id: int


class RawMaterialCreate(RawMaterialBase):
    pass


class RawMaterialResponse(RawMaterialBase):
    id: int

    model_config = ConfigDict(from_attributes=True)