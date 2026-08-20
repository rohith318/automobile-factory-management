from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.robotics import Robotics


def create_robotics(db: Session, robotics: Robotics) -> Robotics:
    db.add(robotics)
    db.commit()
    db.refresh(robotics)
    return robotics


def get_robotics_list(db: Session) -> list[Robotics]:
    return db.scalars(select(Robotics)).all()


def get_robotics(db: Session, robotics_id: int) -> Robotics | None:
    return db.get(Robotics, robotics_id)


def update_robotics(db: Session, robotics: Robotics) -> Robotics:
    db.commit()
    db.refresh(robotics)
    return robotics


def delete_robotics(db: Session, robotics: Robotics) -> None:
    db.delete(robotics)
    db.commit()