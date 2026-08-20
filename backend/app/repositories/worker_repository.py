from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.worker import Worker


def create_worker(db: Session, worker: Worker) -> Worker:
    db.add(worker)
    db.commit()
    db.refresh(worker)
    return worker


def get_workers(db: Session) -> list[Worker]:
    return db.scalars(select(Worker)).all()


def get_worker(db: Session, worker_id: int) -> Worker | None:
    return db.get(Worker, worker_id)


def update_worker(db: Session, worker: Worker) -> Worker:
    db.commit()
    db.refresh(worker)
    return worker


def delete_worker(db: Session, worker: Worker) -> None:
    db.delete(worker)
    db.commit()