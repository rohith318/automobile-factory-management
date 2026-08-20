from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.websocket_manager import manager

from app.database.database import get_db

from app.schemas.machinery import (
    MachineryCreate,
    MachineryResponse,
    MachineryMonitoringUpdate,
)

from app.services.machinery_service import (
    create_machinery_service,
    delete_machinery_service,
    get_machinery_list_service,
    get_machinery_service,
    update_machinery_service,
    get_predictive_maintenance_service,
    get_machine_monitoring_service,
    update_machine_monitoring_service,
)


router = APIRouter(
    prefix="/machinery",
    tags=["Machinery"],
)


# =========================================================
# CREATE MACHINERY
# =========================================================

@router.post(
    "/",
    response_model=MachineryResponse,
)
def create_machinery(
    data: MachineryCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):

    return create_machinery_service(
        db,
        data,
    )


# =========================================================
# MACHINE MONITORING
# IMPORTANT:
# This route must come BEFORE /{machinery_id}
# =========================================================

@router.get(
    "/monitoring",
)
def get_machine_monitoring(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):

    return get_machine_monitoring_service(
        db,
    )


# =========================================================
# UPDATE MACHINE MONITORING
# =========================================================

@router.put(
    "/{machinery_id}/monitor",
    response_model=MachineryResponse,
)
async def update_machine_monitoring(
    machinery_id: int,
    data: MachineryMonitoringUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):

    machinery = update_machine_monitoring_service(
        db,
        machinery_id,
        data,
    )

    if not machinery:
        raise HTTPException(
            status_code=404,
            detail="Machinery not found",
        )

    # Send real-time notification
    await manager.broadcast({
        "type": "MACHINE_ALERT",
        "title": "Machine Status Updated",
        "message": (
            f"{machinery.machine_name} "
            f"is now {machinery.machine_status}."
        ),
    })

    return machinery


# =========================================================
# GET MACHINERY LIST
# =========================================================

@router.get(
    "/",
    response_model=list[MachineryResponse],
)
def get_machinery_list(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):

    return get_machinery_list_service(
        db,
    )

# ==================================================
# PREDICTIVE MAINTENANCE
# ==================================================

@router.get("/predictive-maintenance")
def predictive_maintenance(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_predictive_maintenance_service(db)

# =========================================================
# GET SINGLE MACHINERY
# =========================================================

@router.get(
    "/{machinery_id}",
    response_model=MachineryResponse,
)
def get_machinery(
    machinery_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):

    machinery = get_machinery_service(
        db,
        machinery_id,
    )

    if not machinery:
        raise HTTPException(
            status_code=404,
            detail="Machinery not found",
        )

    return machinery


# =========================================================
# UPDATE MACHINERY
# =========================================================

@router.put(
    "/{machinery_id}",
    response_model=MachineryResponse,
)
def update_machinery(
    machinery_id: int,
    data: MachineryCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):

    machinery = update_machinery_service(
        db,
        machinery_id,
        data,
    )

    if not machinery:
        raise HTTPException(
            status_code=404,
            detail="Machinery not found",
        )

    return machinery


# =========================================================
# DELETE MACHINERY
# =========================================================

@router.delete(
    "/{machinery_id}"
)
def delete_machinery(
    machinery_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):

    deleted = delete_machinery_service(
        db,
        machinery_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Machinery not found",
        )

    return {
        "message": "Machinery deleted successfully"
    }