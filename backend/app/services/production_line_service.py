from sqlalchemy.orm import Session

from app.models.production_line import ProductionLine
from app.repositories.production_line_repository import (
    create_production_line,
    delete_production_line,
    get_production_line,
    get_production_line_list,
    update_production_line,
)
from app.schemas.production_line import ProductionLineCreate


def create_production_line_service(
    db: Session, data: ProductionLineCreate
) -> ProductionLine:
    production_line = ProductionLine(**data.model_dump())
    return create_production_line(db, production_line)


def get_production_line_list_service(
    db: Session,
) -> list[ProductionLine]:
    return get_production_line_list(db)


def get_production_line_service(
    db: Session, production_line_id: int
) -> ProductionLine | None:
    return get_production_line(db, production_line_id)


def update_production_line_service(
    db: Session,
    production_line_id: int,
    data: ProductionLineCreate,
) -> ProductionLine | None:
    production_line = get_production_line(db, production_line_id)

    if not production_line:
        return None

    for field, value in data.model_dump().items():
        setattr(production_line, field, value)

    return update_production_line(db, production_line)


def delete_production_line_service(
    db: Session, production_line_id: int
) -> bool:
    production_line = get_production_line(db, production_line_id)

    if not production_line:
        return False

    delete_production_line(db, production_line)
    return True