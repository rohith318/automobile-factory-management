from pydantic import BaseModel, ConfigDict


class QualityCheckBase(BaseModel):
    production_id: int
    checked_by: str
    quality_status: str
    remarks: str | None = None


class QualityCheckCreate(QualityCheckBase):
    pass


class QualityCheckResponse(QualityCheckBase):
    id: int

    model_config = ConfigDict(from_attributes=True)