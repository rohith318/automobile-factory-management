from sqlalchemy.orm import Session

from app.models.quality_check import QualityCheck
from app.repositories.quality_check_repository import (
    create_quality_check,
    delete_quality_check,
    get_quality_check,
    get_quality_check_list,
    update_quality_check,
)
from app.schemas.quality_check import QualityCheckCreate


def create_quality_check_service(
    db: Session, data: QualityCheckCreate
) -> QualityCheck:
    quality_check = QualityCheck(**data.model_dump())
    return create_quality_check(db, quality_check)


def get_quality_check_list_service(
    db: Session,
) -> list[QualityCheck]:
    return get_quality_check_list(db)


def get_quality_check_service(
    db: Session, quality_check_id: int
) -> QualityCheck | None:
    return get_quality_check(db, quality_check_id)


def update_quality_check_service(
    db: Session,
    quality_check_id: int,
    data: QualityCheckCreate,
) -> QualityCheck | None:
    quality_check = get_quality_check(db, quality_check_id)

    if not quality_check:
        return None

    for field, value in data.model_dump().items():
        setattr(quality_check, field, value)

    return update_quality_check(db, quality_check)


def delete_quality_check_service(
    db: Session, quality_check_id: int
) -> bool:
    quality_check = get_quality_check(db, quality_check_id)

    if not quality_check:
        return False

    delete_quality_check(db, quality_check)
    return True


def get_quality_report_service(db: Session):
    quality_checks = get_quality_check_list(db)

    total_checks = len(quality_checks)
    passed = sum(
        1 for q in quality_checks
        if q.quality_status == "PASSED"
    )
    failed = sum(
        1 for q in quality_checks
        if q.quality_status == "FAILED"
    )

    return {
        "total_quality_checks": total_checks,
        "passed": passed,
        "failed": failed,
        "quality_checks": [
            {
                "id": q.id,
                "production_id": q.production_id,
                "checked_by": q.checked_by,
                "quality_status": q.quality_status,
                "remarks": q.remarks,
            }
            for q in quality_checks
        ],
    }