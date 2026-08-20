from sqlalchemy.orm import Session

from app.models.raw_material import RawMaterial
from app.repositories.raw_material_repository import (
    create_raw_material,
    delete_raw_material,
    get_raw_material,
    get_raw_material_list,
    update_raw_material,
)
from app.schemas.raw_material import RawMaterialCreate


def create_raw_material_service(
    db: Session, data: RawMaterialCreate
) -> RawMaterial:
    material = RawMaterial(**data.model_dump())
    return create_raw_material(db, material)


def get_raw_material_list_service(
    db: Session,
) -> list[RawMaterial]:
    return get_raw_material_list(db)


def get_raw_material_service(
    db: Session, material_id: int
) -> RawMaterial | None:
    return get_raw_material(db, material_id)


def update_raw_material_service(
    db: Session,
    material_id: int,
    data: RawMaterialCreate,
) -> RawMaterial | None:
    material = get_raw_material(db, material_id)

    if not material:
        return None

    for field, value in data.model_dump().items():
        setattr(material, field, value)

    return update_raw_material(db, material)


def delete_raw_material_service(
    db: Session, material_id: int
) -> bool:
    material = get_raw_material(db, material_id)

    if not material:
        return False

    delete_raw_material(db, material)
    return True