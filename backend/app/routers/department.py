from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.schemas.department import DepartmentCreate, DepartmentResponse
from app.services.department_service import (
    create_department_service,
    delete_department_service,
    get_department_service,
    get_departments_service,
    update_department_service,
)

router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


@router.post("/", response_model=DepartmentResponse)
def create_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return create_department_service(db, data)


@router.get("/", response_model=list[DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_departments_service(db)


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    department = get_department_service(db, department_id)

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found",
        )

    return department


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    department = update_department_service(
        db,
        department_id,
        data,
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found",
        )

    return department


@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    deleted = delete_department_service(db, department_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Department not found",
        )

    return {
        "message": "Department deleted successfully"
    }