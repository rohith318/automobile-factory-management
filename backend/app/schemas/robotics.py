from pydantic import BaseModel, ConfigDict


class RoboticsBase(BaseModel):
    robot_code: str
    robot_name: str
    automation_type: str
    department_id: int
    maintenance_cycle_days: int
    current_status: str = "OPERATIONAL"


class RoboticsCreate(RoboticsBase):
    pass


class RoboticsResponse(RoboticsBase):
    id: int

    model_config = ConfigDict(from_attributes=True)