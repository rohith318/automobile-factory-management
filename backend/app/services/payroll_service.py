from sqlalchemy.orm import Session

from app.models.payroll import Payroll
from app.repositories.payroll_repository import (
    create_payroll,
    delete_payroll,
    get_payroll,
    get_payroll_list,
    update_payroll,
)
from app.schemas.payroll import PayrollCreate


def create_payroll_service(
    db: Session,
    data: PayrollCreate,
) -> Payroll:
    payroll = Payroll(**data.model_dump())
    return create_payroll(db, payroll)


def get_payroll_list_service(
    db: Session,
) -> list[Payroll]:
    return get_payroll_list(db)


def get_payroll_service(
    db: Session,
    payroll_id: int,
) -> Payroll | None:
    return get_payroll(db, payroll_id)


def update_payroll_service(
    db: Session,
    payroll_id: int,
    data: PayrollCreate,
) -> Payroll | None:
    payroll = get_payroll(db, payroll_id)

    if not payroll:
        return None

    for field, value in data.model_dump().items():
        setattr(payroll, field, value)

    return update_payroll(db, payroll)


def delete_payroll_service(
    db: Session,
    payroll_id: int,
) -> bool:
    payroll = get_payroll(db, payroll_id)

    if not payroll:
        return False

    delete_payroll(db, payroll)
    return True

def generate_payroll_service(
    db: Session,
    worker_id: int,
):
    from app.models.worker import Worker

    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return None

    basic_salary = worker.salary or 0

    payroll = Payroll(
        worker_id=worker_id,
        basic_salary=basic_salary,
        overtime_amount=0,
        deductions=0,
        final_salary=basic_salary,
        payment_status="PENDING",
    )

    return create_payroll(db, payroll)