from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.schemas.worker import WorkerCreate, WorkerResponse
from app.services.worker_service import (
    create_worker_service,
    delete_worker_service,
    get_worker_service,
    get_workers_service,
    update_worker_service,
)

router = APIRouter(prefix="/workers", tags=["Workers"])


@router.post("/", response_model=WorkerResponse)
def create_worker(
    data: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return create_worker_service(db, data)


@router.get("/", response_model=list[WorkerResponse])
def get_workers(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    return get_workers_service(db)


@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    worker = get_worker_service(db, worker_id)

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found",
        )

    return worker


@router.put("/{worker_id}", response_model=WorkerResponse)
def update_worker(
    worker_id: int,
    data: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    worker = update_worker_service(db, worker_id, data)

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found",
        )

    return worker


@router.delete("/{worker_id}")
def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    deleted = delete_worker_service(db, worker_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Worker not found",
        )

    return {"message": "Worker deleted successfully"}