from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_current_user

from app.database.database import get_db
from app.schemas.quality_check import (
    QualityCheckCreate,
    QualityCheckResponse,
)
from app.services.quality_check_service import (
    create_quality_check_service,
    delete_quality_check_service,
    get_quality_check_list_service,
    get_quality_check_service,
    update_quality_check_service,
    get_quality_report_service,
)

router = APIRouter(
    prefix="/quality-checks",
    tags=["Quality Control"],
)


@router.post("/", response_model=QualityCheckResponse)
def create_quality_check(
    data: QualityCheckCreate,
    db: Session = Depends(get_db),
):
    return create_quality_check_service(db, data)


@router.get("/", response_model=list[QualityCheckResponse])
def get_quality_check_list(
    db: Session = Depends(get_db),
):
    return get_quality_check_list_service(db)

@router.get("/quality-report")
def get_quality_report(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    return get_quality_report_service(db)

@router.get(
    "/{quality_check_id}",
    response_model=QualityCheckResponse,
)
def get_quality_check(
    quality_check_id: int,
    db: Session = Depends(get_db),
):
    quality_check = get_quality_check_service(
        db, quality_check_id
    )

    if not quality_check:
        raise HTTPException(
            status_code=404,
            detail="Quality check not found",
        )

    return quality_check


@router.put(
    "/{quality_check_id}",
    response_model=QualityCheckResponse,
)
def update_quality_check(
    quality_check_id: int,
    data: QualityCheckCreate,
    db: Session = Depends(get_db),
):
    quality_check = update_quality_check_service(
        db,
        quality_check_id,
        data,
    )

    if not quality_check:
        raise HTTPException(
            status_code=404,
            detail="Quality check not found",
        )

    return quality_check


@router.delete("/{quality_check_id}")
def delete_quality_check(
    quality_check_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_quality_check_service(
        db, quality_check_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Quality check not found",
        )

    return {
        "message": "Quality check deleted successfully"
    }