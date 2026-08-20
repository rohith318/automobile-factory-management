from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.safety_incident import (
    SafetyIncidentCreate,
    SafetyIncidentResponse,
)
from app.services.safety_incident_service import (
    create_safety_incident_service,
    delete_safety_incident_service,
    get_safety_incident_list_service,
    get_safety_incident_service,
    update_safety_incident_service,
)

router = APIRouter(
    prefix="/safety-incidents",
    tags=["Safety Incidents"],
)


@router.post("/", response_model=SafetyIncidentResponse)
def create_safety_incident(
    data: SafetyIncidentCreate,
    db: Session = Depends(get_db),
):
    return create_safety_incident_service(db, data)


@router.get("/", response_model=list[SafetyIncidentResponse])
def get_safety_incident_list(
    db: Session = Depends(get_db),
):
    return get_safety_incident_list_service(db)


@router.get(
    "/{incident_id}",
    response_model=SafetyIncidentResponse,
)
def get_safety_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    incident = get_safety_incident_service(db, incident_id)

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Safety incident not found",
        )

    return incident


@router.put(
    "/{incident_id}",
    response_model=SafetyIncidentResponse,
)
def update_safety_incident(
    incident_id: int,
    data: SafetyIncidentCreate,
    db: Session = Depends(get_db),
):
    incident = update_safety_incident_service(
        db,
        incident_id,
        data,
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Safety incident not found",
        )

    return incident


@router.delete("/{incident_id}")
def delete_safety_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_safety_incident_service(
        db,
        incident_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Safety incident not found",
        )

    return {
        "message": "Safety incident deleted successfully"
    }