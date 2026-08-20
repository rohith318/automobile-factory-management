from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.schemas.factory import FactoryCreate, FactoryResponse
from app.services.factory_service import (
    create_factory_service,
    delete_factory_service,
    get_factories_service,
    get_factory_service,
    update_factory_service,
)

router = APIRouter(
    prefix="/factories",
    tags=["Factories"],
)


@router.post("/", response_model=FactoryResponse)
def create_factory(
    data: FactoryCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return create_factory_service(db, data)


@router.get("/", response_model=list[FactoryResponse])
def get_factories(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_factories_service(db)


@router.get("/{factory_id}", response_model=FactoryResponse)
def get_factory(
    factory_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    factory = get_factory_service(db, factory_id)

    if not factory:
        raise HTTPException(
            status_code=404,
            detail="Factory not found",
        )

    return factory


@router.put("/{factory_id}", response_model=FactoryResponse)
def update_factory(
    factory_id: int,
    data: FactoryCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    factory = update_factory_service(
        db,
        factory_id,
        data,
    )

    if not factory:
        raise HTTPException(
            status_code=404,
            detail="Factory not found",
        )

    return factory


@router.delete("/{factory_id}")
def delete_factory(
    factory_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    deleted = delete_factory_service(db, factory_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Factory not found",
        )

    return {
        "message": "Factory deleted successfully"
    }