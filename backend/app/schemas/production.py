from pydantic import BaseModel, ConfigDict


class ProductionBase(BaseModel):
    vehicle_model: str
    production_line_id: int
    chassis_number: str
    production_stage: str
    completion_status: str = "IN_PROGRESS"
    production_cost: float = 0


class ProductionCreate(ProductionBase):
    pass


class ProductionResponse(ProductionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)