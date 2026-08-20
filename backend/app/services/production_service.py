from sqlalchemy.orm import Session

from app.models.vehicle_production import VehicleProduction
from app.repositories.production_repository import (
    create_production,
    delete_production,
    get_production,
    get_production_list,
    update_production,
)
from app.schemas.production import ProductionCreate



def create_production_service(
    db: Session, data: ProductionCreate
) -> VehicleProduction:
    production = VehicleProduction(**data.model_dump())
    return create_production(db, production)


def get_production_list_service(
    db: Session,
) -> list[VehicleProduction]:
    return get_production_list(db)


def get_production_service(
    db: Session, production_id: int
) -> VehicleProduction | None:
    return get_production(db, production_id)


def update_production_service(
    db: Session,
    production_id: int,
    data: ProductionCreate,
) -> VehicleProduction | None:
    production = get_production(db, production_id)

    if not production:
        return None

    for field, value in data.model_dump().items():
        setattr(production, field, value)

    return update_production(db, production)


def delete_production_service(
    db: Session, production_id: int
) -> bool:
    production = get_production(db, production_id)

    if not production:
        return False

    delete_production(db, production)
    return True

def get_live_production_status_service(db: Session):
    productions = db.query(VehicleProduction).all()

    total = len(productions)
    in_progress = sum(
        1 for p in productions
        if p.completion_status == "IN_PROGRESS"
    )
    completed = sum(
        1 for p in productions
        if p.completion_status == "COMPLETED"
    )

    return {
        "total_production": total,
        "in_progress": in_progress,
        "completed": completed,
        "active_productions": [
            {
                "id": p.id,
                "vehicle_model": p.vehicle_model,
                "production_line_id": p.production_line_id,
                "chassis_number": p.chassis_number,
                "production_stage": p.production_stage,
                "completion_status": p.completion_status,
                "production_cost": p.production_cost
            }
            for p in productions
            if p.completion_status == "IN_PROGRESS"
        ]
    }

def get_production_analytics_service(db: Session):
    productions = db.query(VehicleProduction).all()

    total_production = len(productions)

    in_progress = sum(
        1 for p in productions
        if p.completion_status == "IN_PROGRESS"
    )

    completed = sum(
        1 for p in productions
        if p.completion_status == "COMPLETED"
    )

    total_cost = sum(
        p.production_cost or 0
        for p in productions
    )

    average_cost = (
        total_cost / total_production
        if total_production > 0
        else 0
    )

    return {
        "total_production": total_production,
        "in_progress": in_progress,
        "completed": completed,
        "total_production_cost": total_cost,
        "average_production_cost": average_cost,
    }