from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department import Department


def create_department(
    db: Session,
    department: Department,
) -> Department:
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


def get_departments(db: Session) -> list[Department]:
    return db.scalars(select(Department)).all()


def get_department(
    db: Session,
    department_id: int,
) -> Department | None:
    return db.get(Department, department_id)


def update_department(
    db: Session,
    department: Department,
) -> Department:
    db.commit()
    db.refresh(department)
    return department


def delete_department(
    db: Session,
    department: Department,
) -> None:
    db.delete(department)
    db.commit()