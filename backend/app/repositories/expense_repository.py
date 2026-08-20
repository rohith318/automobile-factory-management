from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.factory_expense import FactoryExpense


def create_expense(
    db: Session,
    expense: FactoryExpense,
) -> FactoryExpense:
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def get_expense_list(
    db: Session,
) -> list[FactoryExpense]:
    return db.scalars(select(FactoryExpense)).all()


def get_expense(
    db: Session,
    expense_id: int,
) -> FactoryExpense | None:
    return db.get(FactoryExpense, expense_id)


def update_expense(
    db: Session,
    expense: FactoryExpense,
) -> FactoryExpense:
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(
    db: Session,
    expense: FactoryExpense,
) -> None:
    db.delete(expense)
    db.commit()