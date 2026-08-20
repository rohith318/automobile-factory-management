from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.payroll import Payroll


def create_payroll(db: Session, payroll: Payroll) -> Payroll:
    db.add(payroll)
    db.commit()
    db.refresh(payroll)
    return payroll


def get_payroll_list(db: Session) -> list[Payroll]:
    return db.scalars(select(Payroll)).all()


def get_payroll(db: Session, payroll_id: int) -> Payroll | None:
    return db.get(Payroll, payroll_id)


def update_payroll(db: Session, payroll: Payroll) -> Payroll:
    db.commit()
    db.refresh(payroll)
    return payroll


def delete_payroll(db: Session, payroll: Payroll) -> None:
    db.delete(payroll)
    db.commit()