from pydantic import BaseModel, ConfigDict


class DepartmentBase(BaseModel):
    department_name: str
    factory_id: int


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentResponse(DepartmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)