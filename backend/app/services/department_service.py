from sqlalchemy.orm import Session

from app.models.department import Department
from app.repositories.department_repository import (
    create_department,
    delete_department,
    get_department,
    get_departments,
    update_department,
)
from app.schemas.department import DepartmentCreate


def create_department_service(
    db: Session,
    data: DepartmentCreate,
) -> Department:
    department = Department(**data.model_dump())
    return create_department(db, department)


def get_departments_service(
    db: Session,
) -> list[Department]:
    return get_departments(db)


def get_department_service(
    db: Session,
    department_id: int,
) -> Department | None:
    return get_department(db, department_id)


def update_department_service(
    db: Session,
    department_id: int,
    data: DepartmentCreate,
) -> Department | None:
    department = get_department(db, department_id)

    if not department:
        return None

    for field, value in data.model_dump().items():
        setattr(department, field, value)

    return update_department(db, department)


def delete_department_service(
    db: Session,
    department_id: int,
) -> bool:
    department = get_department(db, department_id)

    if not department:
        return False

    delete_department(db, department)
    return True