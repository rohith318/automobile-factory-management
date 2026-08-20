from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vehicle_production import VehicleProduction


def create_production(
    db: Session, production: VehicleProduction
) -> VehicleProduction:
    db.add(production)
    db.commit()
    db.refresh(production)
    return production


def get_production_list(db: Session) -> list[VehicleProduction]:
    return db.scalars(select(VehicleProduction)).all()


def get_production(
    db: Session, production_id: int
) -> VehicleProduction | None:
    return db.get(VehicleProduction, production_id)


def update_production(
    db: Session, production: VehicleProduction
) -> VehicleProduction:
    db.commit()
    db.refresh(production)
    return production


def delete_production(
    db: Session, production: VehicleProduction
) -> None:
    db.delete(production)
    db.commit()