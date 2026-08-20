from pydantic import BaseModel, ConfigDict


class ProductionLineBase(BaseModel):
    line_name: str
    department_id: int
    target_per_day: int = 0
    current_output: int = 0


class ProductionLineCreate(ProductionLineBase):
    pass


class ProductionLineResponse(ProductionLineBase):
    id: int

    model_config = ConfigDict(from_attributes=True)