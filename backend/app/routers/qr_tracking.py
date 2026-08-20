from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.models.machinery import Machinery


router = APIRouter(
    prefix="/qr",
    tags=["QR Tracking"],
)


@router.get("/machinery/{machinery_id}")
def get_machinery_qr_data(
    machinery_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    machine = (
        db.query(Machinery)
        .filter(Machinery.id == machinery_id)
        .first()
    )

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machinery not found",
        )

    return {
        "asset_type": "MACHINERY",
        "asset_id": machine.id,
        "machine_code": machine.machine_code,
        "machine_name": machine.machine_name,
        "machine_type": machine.machine_type,
        "department_id": machine.department_id,
        "machine_status": machine.machine_status,
        "running_hours": machine.running_hours,
        "purchase_date": machine.purchase_date,
        "warranty_expiry": machine.warranty_expiry,
    }


@router.get("/lookup")
def lookup_qr_asset(
    asset_type: str,
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    asset_type = asset_type.upper()

    if asset_type == "MACHINERY":

        machine = (
            db.query(Machinery)
            .filter(Machinery.id == asset_id)
            .first()
        )

        if not machine:
            raise HTTPException(
                status_code=404,
                detail="Machinery not found",
            )

        return {
            "asset_type": "MACHINERY",
            "asset_id": machine.id,
            "machine_code": machine.machine_code,
            "machine_name": machine.machine_name,
            "machine_type": machine.machine_type,
            "department_id": machine.department_id,
            "machine_status": machine.machine_status,
            "running_hours": machine.running_hours,
            "purchase_date": machine.purchase_date,
            "warranty_expiry": machine.warranty_expiry,
        }

    raise HTTPException(
        status_code=400,
        detail="Unsupported QR asset type",
    )