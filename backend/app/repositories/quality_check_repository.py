from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.quality_check import QualityCheck


def create_quality_check(
    db: Session, quality_check: QualityCheck
) -> QualityCheck:
    db.add(quality_check)
    db.commit()
    db.refresh(quality_check)
    return quality_check


def get_quality_check_list(db: Session) -> list[QualityCheck]:
    return db.scalars(select(QualityCheck)).all()


def get_quality_check(
    db: Session, quality_check_id: int
) -> QualityCheck | None:
    return db.get(QualityCheck, quality_check_id)


def update_quality_check(
    db: Session, quality_check: QualityCheck
) -> QualityCheck:
    db.commit()
    db.refresh(quality_check)
    return quality_check


def delete_quality_check(
    db: Session, quality_check: QualityCheck
) -> None:
    db.delete(quality_check)
    db.commit()