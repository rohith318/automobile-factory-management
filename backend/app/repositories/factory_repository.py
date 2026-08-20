from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.factory import Factory


def create_factory(db: Session, factory: Factory) -> Factory:
    db.add(factory)
    db.commit()
    db.refresh(factory)
    return factory


def get_factories(db: Session) -> list[Factory]:
    return db.scalars(select(Factory)).all()


def get_factory(db: Session, factory_id: int) -> Factory | None:
    return db.get(Factory, factory_id)


def update_factory(db: Session, factory: Factory) -> Factory:
    db.commit()
    db.refresh(factory)
    return factory


def delete_factory(db: Session, factory: Factory) -> None:
    db.delete(factory)
    db.commit()