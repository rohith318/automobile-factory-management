from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.machinery import Machinery


def create_machinery(db: Session, machinery: Machinery) -> Machinery:
    db.add(machinery)
    db.commit()
    db.refresh(machinery)
    return machinery


def get_machinery_list(db: Session) -> list[Machinery]:
    return db.scalars(select(Machinery)).all()


def get_machinery(db: Session, machinery_id: int) -> Machinery | None:
    return db.get(Machinery, machinery_id)


def update_machinery(db: Session, machinery: Machinery) -> Machinery:
    db.commit()
    db.refresh(machinery)
    return machinery


def delete_machinery(db: Session, machinery: Machinery) -> None:
    db.delete(machinery)
    db.commit()