from sqlalchemy.orm import Session

from app.models.factory_expense import FactoryExpense
from app.repositories.expense_repository import (
    create_expense,
    delete_expense,
    get_expense,
    get_expense_list,
    update_expense,
)
from app.schemas.expense import ExpenseCreate


def create_expense_service(
    db: Session,
    data: ExpenseCreate,
) -> FactoryExpense:
    expense = FactoryExpense(**data.model_dump())
    return create_expense(db, expense)


def get_expense_list_service(
    db: Session,
) -> list[FactoryExpense]:
    return get_expense_list(db)


def get_expense_service(
    db: Session,
    expense_id: int,
) -> FactoryExpense | None:
    return get_expense(db, expense_id)


def update_expense_service(
    db: Session,
    expense_id: int,
    data: ExpenseCreate,
) -> FactoryExpense | None:
    expense = get_expense(db, expense_id)

    if not expense:
        return None

    for field, value in data.model_dump().items():
        setattr(expense, field, value)

    return update_expense(db, expense)


def delete_expense_service(
    db: Session,
    expense_id: int,
) -> bool:
    expense = get_expense(db, expense_id)

    if not expense:
        return False

    delete_expense(db, expense)
    return True


def get_cost_analytics_service(db: Session):
    expenses = db.query(FactoryExpense).all()

    total_expenses = len(expenses)

    total_cost = sum(
        expense.amount or 0
        for expense in expenses
    )

    average_cost = (
        total_cost / total_expenses
        if total_expenses > 0
        else 0
    )

    return {
        "total_expenses": total_expenses,
        "total_cost": total_cost,
        "average_cost": average_cost,
        "expenses": [
            {
                "id": expense.id,
                "expense_type": expense.expense_type,
                "amount": expense.amount,
                "expense_date": expense.expense_date,
                "remarks": expense.remarks,
            }
            for expense in expenses
        ],
    }