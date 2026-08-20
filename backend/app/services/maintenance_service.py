from sqlalchemy.orm import Session

from app.models.maintenance import MaintenanceLog
from app.repositories.maintenance_repository import (
    create_maintenance,
    delete_maintenance,
    get_maintenance,
    get_maintenance_list,
    update_maintenance,
)
from app.schemas.maintenance import MaintenanceCreate


def create_maintenance_service(
    db: Session,
    data: MaintenanceCreate,
) -> MaintenanceLog:
    maintenance = MaintenanceLog(
        **data.model_dump()
    )

    return create_maintenance(
        db,
        maintenance,
    )


def get_maintenance_list_service(
    db: Session,
) -> list[MaintenanceLog]:
    return get_maintenance_list(db)


def get_maintenance_service(
    db: Session,
    maintenance_id: int,
) -> MaintenanceLog | None:
    return get_maintenance(
        db,
        maintenance_id,
    )


def update_maintenance_service(
    db: Session,
    maintenance_id: int,
    data: MaintenanceCreate,
) -> MaintenanceLog | None:

    maintenance = get_maintenance(
        db,
        maintenance_id,
    )

    if not maintenance:
        return None

    for field, value in data.model_dump().items():
        setattr(
            maintenance,
            field,
            value,
        )

    return update_maintenance(
        db,
        maintenance,
    )


def delete_maintenance_service(
    db: Session,
    maintenance_id: int,
) -> bool:

    maintenance = get_maintenance(
        db,
        maintenance_id,
    )

    if not maintenance:
        return False

    delete_maintenance(
        db,
        maintenance,
    )

    return True


def get_maintenance_cost_report_service(
    db: Session,
):

    logs = db.query(
        MaintenanceLog
    ).all()

    total_cost = sum(
        log.maintenance_cost or 0
        for log in logs
    )

    return {
        "total_maintenance_records": len(logs),
        "total_maintenance_cost": total_cost,
        "maintenance_logs": [
            {
                "id": log.id,
                "machine_id": log.machine_id,
                "robot_id": log.robot_id,
                "maintenance_type": log.maintenance_type,
                "maintenance_cost": log.maintenance_cost,
                "maintenance_date": log.maintenance_date,
                "technician_name": log.technician_name,
                "remarks": log.remarks,
            }
            for log in logs
        ],
    }