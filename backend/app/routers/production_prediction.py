from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.services.production_prediction_service import (
    get_production_prediction_service,
    get_production_line_prediction_service,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Production Prediction"],
)


@router.get(
    "/production-prediction"
)
def get_production_prediction(
    db: Session = Depends(get_db),
    current_user: int = Depends(
        get_current_user
    ),
):
    return get_production_prediction_service(
        db
    )


@router.get(
    "/production-prediction/{production_line_id}"
)
def get_production_line_prediction(
    production_line_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(
        get_current_user
    ),
):
    prediction = (
        get_production_line_prediction_service(
            db,
            production_line_id,
        )
    )

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Production line not found",
        )

    return prediction