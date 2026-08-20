from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.production_line import ProductionLine


def create_production_line(
    db: Session, production_line: ProductionLine
) -> ProductionLine:
    db.add(production_line)
    db.commit()
    db.refresh(production_line)
    return production_line


def get_production_line_list(db: Session) -> list[ProductionLine]:
    return db.scalars(select(ProductionLine)).all()


def get_production_line(
    db: Session, production_line_id: int
) -> ProductionLine | None:
    return db.get(ProductionLine, production_line_id)


def update_production_line(
    db: Session, production_line: ProductionLine
) -> ProductionLine:
    db.commit()
    db.refresh(production_line)
    return production_line


def delete_production_line(
    db: Session, production_line: ProductionLine
) -> None:
    db.delete(production_line)
    db.commit()