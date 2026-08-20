from sqlalchemy.orm import Session

from app.models.robotics import Robotics
from app.repositories.robotics_repository import (
    create_robotics,
    delete_robotics,
    get_robotics,
    get_robotics_list,
    update_robotics,
)
from app.schemas.robotics import RoboticsCreate


def create_robotics_service(
    db: Session, data: RoboticsCreate
) -> Robotics:
    robotics = Robotics(**data.model_dump())
    return create_robotics(db, robotics)


def get_robotics_list_service(db: Session) -> list[Robotics]:
    return get_robotics_list(db)


def get_robotics_service(
    db: Session, robotics_id: int
) -> Robotics | None:
    return get_robotics(db, robotics_id)


def update_robotics_service(
    db: Session,
    robotics_id: int,
    data: RoboticsCreate,
) -> Robotics | None:
    robotics = get_robotics(db, robotics_id)

    if not robotics:
        return None

    for field, value in data.model_dump().items():
        setattr(robotics, field, value)

    return update_robotics(db, robotics)


def delete_robotics_service(
    db: Session, robotics_id: int
) -> bool:
    robotics = get_robotics(db, robotics_id)

    if not robotics:
        return False

    delete_robotics(db, robotics)
    return True