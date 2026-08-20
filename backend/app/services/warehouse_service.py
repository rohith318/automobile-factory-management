from sqlalchemy.orm import Session

from app.models.warehouse import Warehouse
from app.repositories.warehouse_repository import (
    create_warehouse,
    delete_warehouse,
    get_warehouse,
    get_warehouse_list,
    update_warehouse,
)
from app.schemas.warehouse import WarehouseCreate


def create_warehouse_service(
    db: Session, data: WarehouseCreate
) -> Warehouse:
    warehouse = Warehouse(**data.model_dump())
    return create_warehouse(db, warehouse)


def get_warehouse_list_service(
    db: Session,
) -> list[Warehouse]:
    return get_warehouse_list(db)


def get_warehouse_service(
    db: Session, warehouse_id: int
) -> Warehouse | None:
    return get_warehouse(db, warehouse_id)


def update_warehouse_service(
    db: Session,
    warehouse_id: int,
    data: WarehouseCreate,
) -> Warehouse | None:
    warehouse = get_warehouse(db, warehouse_id)

    if not warehouse:
        return None

    for field, value in data.model_dump().items():
        setattr(warehouse, field, value)

    return update_warehouse(db, warehouse)


def delete_warehouse_service(
    db: Session, warehouse_id: int
) -> bool:
    warehouse = get_warehouse(db, warehouse_id)

    if not warehouse:
        return False

    delete_warehouse(db, warehouse)
    return True