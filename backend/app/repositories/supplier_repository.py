from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.supplier import Supplier


def create_supplier(db: Session, supplier: Supplier) -> Supplier:
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def get_supplier_list(db: Session) -> list[Supplier]:
    return db.scalars(select(Supplier)).all()


def get_supplier(db: Session, supplier_id: int) -> Supplier | None:
    return db.get(Supplier, supplier_id)


def update_supplier(db: Session, supplier: Supplier) -> Supplier:
    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier: Supplier) -> None:
    db.delete(supplier)
    db.commit()