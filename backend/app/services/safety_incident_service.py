from sqlalchemy.orm import Session

from app.models.safety_incident import SafetyIncident
from app.repositories.safety_incident_repository import (
    create_safety_incident,
    delete_safety_incident,
    get_safety_incident,
    get_safety_incident_list,
    update_safety_incident,
)
from app.schemas.safety_incident import SafetyIncidentCreate


def create_safety_incident_service(
    db: Session,
    data: SafetyIncidentCreate,
) -> SafetyIncident:
    incident = SafetyIncident(**data.model_dump())
    return create_safety_incident(db, incident)


def get_safety_incident_list_service(
    db: Session,
) -> list[SafetyIncident]:
    return get_safety_incident_list(db)


def get_safety_incident_service(
    db: Session,
    incident_id: int,
) -> SafetyIncident | None:
    return get_safety_incident(db, incident_id)


def update_safety_incident_service(
    db: Session,
    incident_id: int,
    data: SafetyIncidentCreate,
) -> SafetyIncident | None:
    incident = get_safety_incident(db, incident_id)

    if not incident:
        return None

    for field, value in data.model_dump().items():
        setattr(incident, field, value)

    return update_safety_incident(db, incident)


def delete_safety_incident_service(
    db: Session,
    incident_id: int,
) -> bool:
    incident = get_safety_incident(db, incident_id)

    if not incident:
        return False

    delete_safety_incident(db, incident)
    return True