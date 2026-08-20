from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_current_user

from app.database.database import get_db
from app.schemas.payroll import PayrollCreate, PayrollResponse
from app.services.payroll_service import (
    create_payroll_service,
    delete_payroll_service,
    get_payroll_list_service,
    get_payroll_service,
    update_payroll_service,
    generate_payroll_service,
)

router = APIRouter(
    prefix="/payroll",
    tags=["Payroll"],
)


@router.post("/", response_model=PayrollResponse)
def create_payroll(
    data: PayrollCreate,
    db: Session = Depends(get_db),
):
    return create_payroll_service(db, data)


@router.get("/", response_model=list[PayrollResponse])
def get_payroll_list(
    db: Session = Depends(get_db),
):
    return get_payroll_list_service(db)

@router.post("/generate")
def generate_payroll(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    payroll = generate_payroll_service(db, worker_id)

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return payroll


@router.get("/{payroll_id}", response_model=PayrollResponse)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
):
    payroll = get_payroll_service(db, payroll_id)

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found",
        )

    return payroll


@router.put(
    "/{payroll_id}",
    response_model=PayrollResponse,
)
def update_payroll(
    payroll_id: int,
    data: PayrollCreate,
    db: Session = Depends(get_db),
):
    payroll = update_payroll_service(
        db,
        payroll_id,
        data,
    )

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found",
        )

    return payroll


@router.delete("/{payroll_id}")
def delete_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_payroll_service(
        db,
        payroll_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found",
        )

    return {
        "message": "Payroll record deleted successfully"
    }