from sqlalchemy.orm import Session

from app.models.factory import Factory
from app.repositories.factory_repository import (
    create_factory,
    delete_factory,
    get_factories,
    get_factory,
    update_factory,
)
from app.schemas.factory import FactoryCreate


def create_factory_service(
    db: Session,
    data: FactoryCreate,
) -> Factory:
    factory = Factory(**data.model_dump())
    return create_factory(db, factory)


def get_factories_service(
    db: Session,
) -> list[Factory]:
    return get_factories(db)


def get_factory_service(
    db: Session,
    factory_id: int,
) -> Factory | None:
    return get_factory(db, factory_id)


def update_factory_service(
    db: Session,
    factory_id: int,
    data: FactoryCreate,
) -> Factory | None:
    factory = get_factory(db, factory_id)

    if not factory:
        return None

    for field, value in data.model_dump().items():
        setattr(factory, field, value)

    return update_factory(db, factory)


def delete_factory_service(
    db: Session,
    factory_id: int,
) -> bool:
    factory = get_factory(db, factory_id)

    if not factory:
        return False

    delete_factory(db, factory)
    return True