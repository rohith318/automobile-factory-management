from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.repositories.supplier_repository import (
    create_supplier,
    delete_supplier,
    get_supplier,
    get_supplier_list,
    update_supplier,
)
from app.schemas.supplier import SupplierCreate


def create_supplier_service(
    db: Session, data: SupplierCreate
) -> Supplier:
    supplier = Supplier(**data.model_dump())
    return create_supplier(db, supplier)


def get_supplier_list_service(db: Session) -> list[Supplier]:
    return get_supplier_list(db)


def get_supplier_service(
    db: Session, supplier_id: int
) -> Supplier | None:
    return get_supplier(db, supplier_id)


def update_supplier_service(
    db: Session,
    supplier_id: int,
    data: SupplierCreate,
) -> Supplier | None:
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        return None

    for field, value in data.model_dump().items():
        setattr(supplier, field, value)

    return update_supplier(db, supplier)


def delete_supplier_service(
    db: Session, supplier_id: int
) -> bool:
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        return False

    delete_supplier(db, supplier)
    return True