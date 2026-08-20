from sqlalchemy.orm import Session

from app.models.inventory_transaction import InventoryTransaction
from app.repositories.inventory_transaction_repository import (
    create_transaction,
    delete_transaction,
    get_transaction,
    get_transaction_list,
    update_transaction,
)
from app.schemas.inventory_transaction import InventoryTransactionCreate


def create_transaction_service(
    db: Session,
    data: InventoryTransactionCreate,
) -> InventoryTransaction:
    transaction = InventoryTransaction(**data.model_dump())
    return create_transaction(db, transaction)


def get_transaction_list_service(
    db: Session,
) -> list[InventoryTransaction]:
    return get_transaction_list(db)


def get_transaction_service(
    db: Session,
    transaction_id: int,
) -> InventoryTransaction | None:
    return get_transaction(db, transaction_id)


def update_transaction_service(
    db: Session,
    transaction_id: int,
    data: InventoryTransactionCreate,
) -> InventoryTransaction | None:
    transaction = get_transaction(db, transaction_id)

    if not transaction:
        return None

    for field, value in data.model_dump().items():
        setattr(transaction, field, value)

    return update_transaction(db, transaction)


def delete_transaction_service(
    db: Session,
    transaction_id: int,
) -> bool:
    transaction = get_transaction(db, transaction_id)

    if not transaction:
        return False

    delete_transaction(db, transaction)
    return True