from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.websocket_manager import manager

from app.database.database import get_db

from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceResponse,
)

from app.services.maintenance_service import (
    create_maintenance_service,
    delete_maintenance_service,
    get_maintenance_list_service,
    get_maintenance_service,
    update_maintenance_service,
    get_maintenance_cost_report_service,
)


router = APIRouter(
    prefix="/maintenance",
    tags=["Maintenance"],
)


# =========================================================
# CREATE MAINTENANCE
# =========================================================

@router.post(
    "/",
    response_model=MaintenanceResponse,
)
async def create_maintenance(
    data: MaintenanceCreate,
    db: Session = Depends(get_db),
):
    maintenance = create_maintenance_service(
        db,
        data,
    )

    # Send real-time notification
    await manager.broadcast({
        "type": "MAINTENANCE",
        "title": "Maintenance Added",
        "message": (
            f"New {data.maintenance_type} "
            "maintenance record created."
        ),
    })

    return maintenance


# =========================================================
# GET ALL MAINTENANCE
# =========================================================

@router.get(
    "/",
    response_model=list[MaintenanceResponse],
)
def get_maintenance_list(
    db: Session = Depends(get_db),
):
    return get_maintenance_list_service(db)


# =========================================================
# MAINTENANCE COST REPORT
# =========================================================

@router.get("/cost-report")
def get_maintenance_cost_report(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_maintenance_cost_report_service(db)


# =========================================================
# GET SINGLE MAINTENANCE
# =========================================================

@router.get(
    "/{maintenance_id}",
    response_model=MaintenanceResponse,
)
def get_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
):
    maintenance = get_maintenance_service(
        db,
        maintenance_id,
    )

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return maintenance


# =========================================================
# UPDATE MAINTENANCE
# =========================================================

@router.put(
    "/{maintenance_id}",
    response_model=MaintenanceResponse,
)
def update_maintenance(
    maintenance_id: int,
    data: MaintenanceCreate,
    db: Session = Depends(get_db),
):
    maintenance = update_maintenance_service(
        db,
        maintenance_id,
        data,
    )

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return maintenance


# =========================================================
# DELETE MAINTENANCE
# =========================================================

@router.delete(
    "/{maintenance_id}"
)
def delete_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_maintenance_service(
        db,
        maintenance_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return {
        "message": "Maintenance record deleted successfully"
    }