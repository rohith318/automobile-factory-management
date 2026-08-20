from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.supplier import SupplierCreate, SupplierResponse
from app.services.supplier_service import (
    create_supplier_service,
    delete_supplier_service,
    get_supplier_list_service,
    get_supplier_service,
    update_supplier_service,
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
)


@router.post("/", response_model=SupplierResponse)
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
):
    return create_supplier_service(db, data)


@router.get("/", response_model=list[SupplierResponse])
def get_supplier_list(
    db: Session = Depends(get_db),
):
    return get_supplier_list_service(db)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = get_supplier_service(db, supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    return supplier


@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def update_supplier(
    supplier_id: int,
    data: SupplierCreate,
    db: Session = Depends(get_db),
):
    supplier = update_supplier_service(
        db,
        supplier_id,
        data,
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    return supplier


@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_supplier_service(
        db,
        supplier_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    return {
        "message": "Supplier deleted successfully"
    }