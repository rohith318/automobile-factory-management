from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_current_user

from app.database.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.services.expense_service import (
    create_expense_service,
    delete_expense_service,
    get_expense_list_service,
    get_expense_service,
    update_expense_service,
    get_cost_analytics_service,
)

router = APIRouter(
    prefix="/expenses",
    tags=["Factory Expenses"],
)


@router.post("/", response_model=ExpenseResponse)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
):
    return create_expense_service(db, data)


@router.get("/", response_model=list[ExpenseResponse])
def get_expense_list(
    db: Session = Depends(get_db),
):
    return get_expense_list_service(db)


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
):
    expense = get_expense_service(db, expense_id)

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return expense


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
def update_expense(
    expense_id: int,
    data: ExpenseCreate,
    db: Session = Depends(get_db),
):
    expense = update_expense_service(
        db,
        expense_id,
        data,
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_expense_service(db, expense_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return {
        "message": "Expense deleted successfully"
    }

analytics_router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@analytics_router.get("/cost")
def get_cost_analytics(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_cost_analytics_service(db)