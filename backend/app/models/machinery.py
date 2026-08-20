from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Machinery(Base):
    __tablename__ = "machinery"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    machine_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    machine_name: Mapped[str] = mapped_column(String(150), nullable=False)
    machine_type: Mapped[str] = mapped_column(String(100), nullable=False)
    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"), nullable=False
    )
    purchase_date: Mapped[date] = mapped_column(Date, nullable=False)
    warranty_expiry: Mapped[date | None] = mapped_column(Date, nullable=True)
    machine_status: Mapped[str] = mapped_column(
        String(50), default="OPERATIONAL", nullable=False
    )
    running_hours: Mapped[float] = mapped_column(
        Float, default=0, nullable=False
    )