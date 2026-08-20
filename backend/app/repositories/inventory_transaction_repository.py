from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory_transaction import InventoryTransaction


def create_transaction(
    db: Session,
    transaction: InventoryTransaction,
) -> InventoryTransaction:
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def get_transaction_list(
    db: Session,
) -> list[InventoryTransaction]:
    return db.scalars(select(InventoryTransaction)).all()


def get_transaction(
    db: Session,
    transaction_id: int,
) -> InventoryTransaction | None:
    return db.get(InventoryTransaction, transaction_id)


def update_transaction(
    db: Session,
    transaction: InventoryTransaction,
) -> InventoryTransaction:
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(
    db: Session,
    transaction: InventoryTransaction,
) -> None:
    db.delete(transaction)
    db.commit()