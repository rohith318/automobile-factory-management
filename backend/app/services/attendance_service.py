from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.repositories.attendance_repository import (
    create_attendance,
    delete_attendance,
    get_attendance,
    get_attendance_list,
    update_attendance,
)
from app.schemas.attendance import AttendanceCreate


def create_attendance_service(
    db: Session, data: AttendanceCreate
) -> Attendance:
    attendance = Attendance(**data.model_dump())
    return create_attendance(db, attendance)


def get_attendance_list_service(
    db: Session,
) -> list[Attendance]:
    return get_attendance_list(db)


def get_attendance_service(
    db: Session, attendance_id: int
) -> Attendance | None:
    return get_attendance(db, attendance_id)


def update_attendance_service(
    db: Session,
    attendance_id: int,
    data: AttendanceCreate,
) -> Attendance | None:
    attendance = get_attendance(db, attendance_id)

    if not attendance:
        return None

    for field, value in data.model_dump().items():
        setattr(attendance, field, value)

    return update_attendance(db, attendance)


def delete_attendance_service(
    db: Session, attendance_id: int
) -> bool:
    attendance = get_attendance(db, attendance_id)

    if not attendance:
        return False

    delete_attendance(db, attendance)
    return True