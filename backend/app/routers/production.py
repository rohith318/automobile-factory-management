from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.schemas.production import ProductionCreate, ProductionResponse
from app.services.production_service import (
    create_production_service,
    delete_production_service,
    get_production_list_service,
    get_production_service,
    update_production_service,
    get_live_production_status_service,
    get_production_analytics_service,
)


# =========================
# Production Router
# =========================

router = APIRouter(
    prefix="/production",
    tags=["Production"],
)


@router.post("/", response_model=ProductionResponse)
def create_production(
    data: ProductionCreate,
    db: Session = Depends(get_db),
):
    return create_production_service(db, data)


@router.get("/", response_model=list[ProductionResponse])
def get_production_list(
    db: Session = Depends(get_db),
):
    return get_production_list_service(db)


@router.get("/live-status")
def get_live_production_status(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_live_production_status_service(db)


@router.get("/{production_id}", response_model=ProductionResponse)
def get_production(
    production_id: int,
    db: Session = Depends(get_db),
):
    production = get_production_service(
        db,
        production_id,
    )

    if not production:
        raise HTTPException(
            status_code=404,
            detail="Production record not found",
        )

    return production


@router.put("/{production_id}", response_model=ProductionResponse)
def update_production(
    production_id: int,
    data: ProductionCreate,
    db: Session = Depends(get_db),
):
    production = update_production_service(
        db,
        production_id,
        data,
    )

    if not production:
        raise HTTPException(
            status_code=404,
            detail="Production record not found",
        )

    return production


@router.delete("/{production_id}")
def delete_production(
    production_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_production_service(
        db,
        production_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Production record not found",
        )

    return {
        "message": "Production record deleted successfully"
    }


# =========================
# Analytics Router
# =========================

analytics_router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@analytics_router.get("/production")
def get_production_analytics(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_production_analytics_service(db)