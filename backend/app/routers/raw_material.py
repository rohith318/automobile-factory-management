from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.raw_material import (
    RawMaterialCreate,
    RawMaterialResponse,
)
from app.services.raw_material_service import (
    create_raw_material_service,
    delete_raw_material_service,
    get_raw_material_list_service,
    get_raw_material_service,
    update_raw_material_service,
)

router = APIRouter(
    prefix="/raw-materials",
    tags=["Raw Materials"],
)


@router.post("/", response_model=RawMaterialResponse)
def create_raw_material(
    data: RawMaterialCreate,
    db: Session = Depends(get_db),
):
    return create_raw_material_service(db, data)


@router.get("/", response_model=list[RawMaterialResponse])
def get_raw_material_list(
    db: Session = Depends(get_db),
):
    return get_raw_material_list_service(db)


@router.get(
    "/{material_id}",
    response_model=RawMaterialResponse,
)
def get_raw_material(
    material_id: int,
    db: Session = Depends(get_db),
):
    material = get_raw_material_service(db, material_id)

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Raw material not found",
        )

    return material


@router.put(
    "/{material_id}",
    response_model=RawMaterialResponse,
)
def update_raw_material(
    material_id: int,
    data: RawMaterialCreate,
    db: Session = Depends(get_db),
):
    material = update_raw_material_service(
        db,
        material_id,
        data,
    )

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Raw material not found",
        )

    return material


@router.delete("/{material_id}")
def delete_raw_material(
    material_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_raw_material_service(
        db,
        material_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Raw material not found",
        )

    return {
        "message": "Raw material deleted successfully"
    }