from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attendance import Attendance


def create_attendance(
    db: Session, attendance: Attendance
) -> Attendance:
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


def get_attendance_list(db: Session) -> list[Attendance]:
    return db.scalars(select(Attendance)).all()


def get_attendance(
    db: Session, attendance_id: int
) -> Attendance | None:
    return db.get(Attendance, attendance_id)


def update_attendance(
    db: Session, attendance: Attendance
) -> Attendance:
    db.commit()
    db.refresh(attendance)
    return attendance


def delete_attendance(
    db: Session, attendance: Attendance
) -> None:
    db.delete(attendance)
    db.commit()