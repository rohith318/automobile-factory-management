from sqlalchemy.orm import Session

from app.models.worker import Worker
from app.repositories.worker_repository import (
    create_worker,
    delete_worker,
    get_worker,
    get_workers,
    update_worker,
)
from app.schemas.worker import WorkerCreate


def create_worker_service(db: Session, data: WorkerCreate) -> Worker:
    worker = Worker(**data.model_dump())
    return create_worker(db, worker)


def get_workers_service(db: Session) -> list[Worker]:
    return get_workers(db)


def get_worker_service(db: Session, worker_id: int) -> Worker | None:
    return get_worker(db, worker_id)


def update_worker_service(
    db: Session, worker_id: int, data: WorkerCreate
) -> Worker | None:
    worker = get_worker(db, worker_id)

    if not worker:
        return None

    for field, value in data.model_dump().items():
        setattr(worker, field, value)

    return update_worker(db, worker)


def delete_worker_service(db: Session, worker_id: int) -> bool:
    worker = get_worker(db, worker_id)

    if not worker:
        return False

    delete_worker(db, worker)
    return True