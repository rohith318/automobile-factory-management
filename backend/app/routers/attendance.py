from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
)
from app.services.attendance_service import (
    create_attendance_service,
    delete_attendance_service,
    get_attendance_list_service,
    get_attendance_service,
    update_attendance_service,
)

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


@router.post("/", response_model=AttendanceResponse)
def create_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
):
    return create_attendance_service(db, data)


@router.get("/", response_model=list[AttendanceResponse])
def get_attendance_list(
    db: Session = Depends(get_db),
):
    return get_attendance_list_service(db)


@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
):
    attendance = get_attendance_service(db, attendance_id)

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found",
        )

    return attendance


@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
)
def update_attendance(
    attendance_id: int,
    data: AttendanceCreate,
    db: Session = Depends(get_db),
):
    attendance = update_attendance_service(
        db,
        attendance_id,
        data,
    )

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found",
        )

    return attendance


@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_attendance_service(
        db,
        attendance_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found",
        )

    return {
        "message": "Attendance record deleted successfully"
    }