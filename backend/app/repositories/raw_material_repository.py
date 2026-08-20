from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.raw_material import RawMaterial


def create_raw_material(
    db: Session, material: RawMaterial
) -> RawMaterial:
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


def get_raw_material_list(db: Session) -> list[RawMaterial]:
    return db.scalars(select(RawMaterial)).all()


def get_raw_material(
    db: Session, material_id: int
) -> RawMaterial | None:
    return db.get(RawMaterial, material_id)


def update_raw_material(
    db: Session, material: RawMaterial
) -> RawMaterial:
    db.commit()
    db.refresh(material)
    return material


def delete_raw_material(
    db: Session, material: RawMaterial
) -> None:
    db.delete(material)
    db.commit()