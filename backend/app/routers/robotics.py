from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.robotics import RoboticsCreate, RoboticsResponse
from app.services.robotics_service import (
    create_robotics_service,
    delete_robotics_service,
    get_robotics_list_service,
    get_robotics_service,
    update_robotics_service,
)

router = APIRouter(
    prefix="/robotics",
    tags=["Robotics"],
)


@router.post("/", response_model=RoboticsResponse)
def create_robot(
    data: RoboticsCreate,
    db: Session = Depends(get_db),
):
    return create_robotics_service(db, data)


@router.get("/", response_model=list[RoboticsResponse])
def get_robot_list(
    db: Session = Depends(get_db),
):
    return get_robotics_list_service(db)


@router.get("/{robotics_id}", response_model=RoboticsResponse)
def get_robot(
    robotics_id: int,
    db: Session = Depends(get_db),
):
    robotics = get_robotics_service(db, robotics_id)

    if not robotics:
        raise HTTPException(
            status_code=404,
            detail="Robot not found",
        )

    return robotics


@router.put("/{robotics_id}", response_model=RoboticsResponse)
def update_robot(
    robotics_id: int,
    data: RoboticsCreate,
    db: Session = Depends(get_db),
):
    robotics = update_robotics_service(
        db,
        robotics_id,
        data,
    )

    if not robotics:
        raise HTTPException(
            status_code=404,
            detail="Robot not found",
        )

    return robotics


@router.delete("/{robotics_id}")
def delete_robot(
    robotics_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_robotics_service(
        db,
        robotics_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Robot not found",
        )

    return {
        "message": "Robot deleted successfully"
    }