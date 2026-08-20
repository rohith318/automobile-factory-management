from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FactoryBase(BaseModel):
    factory_name: str
    location: str
    total_departments: int = 0


class FactoryCreate(FactoryBase):
    pass


class FactoryResponse(FactoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)