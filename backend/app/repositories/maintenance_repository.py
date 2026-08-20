from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.maintenance import MaintenanceLog


def create_maintenance(
    db: Session, maintenance: MaintenanceLog
) -> MaintenanceLog:
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance


def get_maintenance_list(db: Session) -> list[MaintenanceLog]:
    return db.scalars(select(MaintenanceLog)).all()


def get_maintenance(
    db: Session, maintenance_id: int
) -> MaintenanceLog | None:
    return db.get(MaintenanceLog, maintenance_id)


def update_maintenance(
    db: Session, maintenance: MaintenanceLog
) -> MaintenanceLog:
    db.commit()
    db.refresh(maintenance)
    return maintenance


def delete_maintenance(
    db: Session, maintenance: MaintenanceLog
) -> None:
    db.delete(maintenance)
    db.commit()