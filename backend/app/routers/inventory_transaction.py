from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.inventory_transaction import (
    InventoryTransactionCreate,
    InventoryTransactionResponse,
)
from app.services.inventory_transaction_service import (
    create_transaction_service,
    delete_transaction_service,
    get_transaction_list_service,
    get_transaction_service,
    update_transaction_service,
)

router = APIRouter(
    prefix="/inventory-transactions",
    tags=["Inventory Transactions"],
)


@router.post(
    "/",
    response_model=InventoryTransactionResponse,
)
def create_transaction(
    data: InventoryTransactionCreate,
    db: Session = Depends(get_db),
):
    return create_transaction_service(db, data)


@router.get(
    "/",
    response_model=list[InventoryTransactionResponse],
)
def get_transaction_list(
    db: Session = Depends(get_db),
):
    return get_transaction_list_service(db)


@router.get(
    "/{transaction_id}",
    response_model=InventoryTransactionResponse,
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = get_transaction_service(
        db,
        transaction_id,
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Inventory transaction not found",
        )

    return transaction


@router.put(
    "/{transaction_id}",
    response_model=InventoryTransactionResponse,
)
def update_transaction(
    transaction_id: int,
    data: InventoryTransactionCreate,
    db: Session = Depends(get_db),
):
    transaction = update_transaction_service(
        db,
        transaction_id,
        data,
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Inventory transaction not found",
        )

    return transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_transaction_service(
        db,
        transaction_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Inventory transaction not found",
        )

    return {
        "message": "Inventory transaction deleted successfully"
    }