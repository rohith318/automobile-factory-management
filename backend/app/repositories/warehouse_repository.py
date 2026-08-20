from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.warehouse import Warehouse


def create_warehouse(db: Session, warehouse: Warehouse) -> Warehouse:
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse


def get_warehouse_list(db: Session) -> list[Warehouse]:
    return db.scalars(select(Warehouse)).all()


def get_warehouse(
    db: Session, warehouse_id: int
) -> Warehouse | None:
    return db.get(Warehouse, warehouse_id)


def update_warehouse(db: Session, warehouse: Warehouse) -> Warehouse:
    db.commit()
    db.refresh(warehouse)
    return warehouse


def delete_warehouse(db: Session, warehouse: Warehouse) -> None:
    db.delete(warehouse)
    db.commit()