from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.safety_incident import SafetyIncident


def create_safety_incident(
    db: Session,
    incident: SafetyIncident,
) -> SafetyIncident:
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def get_safety_incident_list(
    db: Session,
) -> list[SafetyIncident]:
    return db.scalars(select(SafetyIncident)).all()


def get_safety_incident(
    db: Session,
    incident_id: int,
) -> SafetyIncident | None:
    return db.get(SafetyIncident, incident_id)


def update_safety_incident(
    db: Session,
    incident: SafetyIncident,
) -> SafetyIncident:
    db.commit()
    db.refresh(incident)
    return incident


def delete_safety_incident(
    db: Session,
    incident: SafetyIncident,
) -> None:
    db.delete(incident)
    db.commit()