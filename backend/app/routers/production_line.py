from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.production_line import (
    ProductionLineCreate,
    ProductionLineResponse,
)
from app.services.production_line_service import (
    create_production_line_service,
    delete_production_line_service,
    get_production_line_list_service,
    get_production_line_service,
    update_production_line_service,
)

router = APIRouter(
    prefix="/production-lines",
    tags=["Production Lines"],
)


@router.post("/", response_model=ProductionLineResponse)
def create_production_line(
    data: ProductionLineCreate,
    db: Session = Depends(get_db),
):
    return create_production_line_service(db, data)


@router.get("/", response_model=list[ProductionLineResponse])
def get_production_line_list(
    db: Session = Depends(get_db),
):
    return get_production_line_list_service(db)


@router.get(
    "/{production_line_id}",
    response_model=ProductionLineResponse,
)
def get_production_line(
    production_line_id: int,
    db: Session = Depends(get_db),
):
    production_line = get_production_line_service(
        db, production_line_id
    )

    if not production_line:
        raise HTTPException(
            status_code=404,
            detail="Production line not found",
        )

    return production_line


@router.put(
    "/{production_line_id}",
    response_model=ProductionLineResponse,
)
def update_production_line(
    production_line_id: int,
    data: ProductionLineCreate,
    db: Session = Depends(get_db),
):
    production_line = update_production_line_service(
        db,
        production_line_id,
        data,
    )

    if not production_line:
        raise HTTPException(
            status_code=404,
            detail="Production line not found",
        )

    return production_line


@router.delete("/{production_line_id}")
def delete_production_line(
    production_line_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_production_line_service(
        db, production_line_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Production line not found",
        )

    return {
        "message": "Production line deleted successfully"
    }