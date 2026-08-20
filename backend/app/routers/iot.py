import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.models.machinery import Machinery
from app.schemas.iot import IoTData, IoTResponse


router = APIRouter(
    prefix="/iot",
    tags=["IoT Machine Integration"],
)


def calculate_risk(
    temperature: float,
    vibration: float,
    rpm: float,
):
    score = 0
    alerts = []

    if temperature >= 80:
        score += 40
        alerts.append("High temperature")
    elif temperature >= 65:
        score += 20

    if vibration >= 8:
        score += 40
        alerts.append("High vibration")
    elif vibration >= 5:
        score += 20

    if rpm >= 5000:
        score += 20
        alerts.append("High RPM")

    if score >= 60:
        risk = "HIGH"
    elif score >= 30:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    alert = ", ".join(alerts) if alerts else None

    return risk, alert


@router.get(
    "/machine/{machine_id}",
    response_model=IoTResponse,
)
def get_machine_iot_data(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    machine = (
        db.query(Machinery)
        .filter(Machinery.id == machine_id)
        .first()
    )

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    temperature = round(
        random.uniform(35, 85), 2
    )

    vibration = round(
        random.uniform(1, 9), 2
    )

    rpm = round(
        random.uniform(1000, 5500), 2
    )

    power_usage = round(
        random.uniform(10, 100), 2
    )

    risk_level, alert = calculate_risk(
        temperature,
        vibration,
        rpm,
    )

    return {
        "machine_id": machine.id,
        "temperature": temperature,
        "vibration": vibration,
        "rpm": rpm,
        "power_usage": power_usage,
        "machine_status": machine.machine_status,
        "risk_level": risk_level,
        "alert": alert,
    }


@router.post(
    "/machine",
    response_model=IoTResponse,
)
def receive_iot_data(
    data: IoTData,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    machine = (
        db.query(Machinery)
        .filter(
            Machinery.id == data.machine_id
        )
        .first()
    )

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    risk_level, alert = calculate_risk(
        data.temperature,
        data.vibration,
        data.rpm,
    )

    return {
        **data.model_dump(),
        "risk_level": risk_level,
        "alert": alert,
    }