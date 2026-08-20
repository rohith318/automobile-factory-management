from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.warehouse import WarehouseCreate, WarehouseResponse
from app.services.warehouse_service import (
    create_warehouse_service,
    delete_warehouse_service,
    get_warehouse_list_service,
    get_warehouse_service,
    update_warehouse_service,
)

router = APIRouter(
    prefix="/warehouses",
    tags=["Warehouses"],
)


@router.post("/", response_model=WarehouseResponse)
def create_warehouse(
    data: WarehouseCreate,
    db: Session = Depends(get_db),
):
    return create_warehouse_service(db, data)


@router.get("/", response_model=list[WarehouseResponse])
def get_warehouse_list(
    db: Session = Depends(get_db),
):
    return get_warehouse_list_service(db)


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
):
    warehouse = get_warehouse_service(db, warehouse_id)

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found",
        )

    return warehouse


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: int,
    data: WarehouseCreate,
    db: Session = Depends(get_db),
):
    warehouse = update_warehouse_service(
        db,
        warehouse_id,
        data,
    )

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found",
        )

    return warehouse


@router.delete("/{warehouse_id}")
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_warehouse_service(db, warehouse_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found",
        )

    return {
        "message": "Warehouse deleted successfully"
    }