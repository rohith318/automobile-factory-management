from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Payroll(Base):
    __tablename__ = "payroll"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_id: Mapped[int] = mapped_column(
        ForeignKey("workers.id"), nullable=False
    )
    basic_salary: Mapped[float] = mapped_column(Float, nullable=False)
    overtime_amount: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    deductions: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    final_salary: Mapped[float] = mapped_column(Float, nullable=False)
    payment_status: Mapped[str] = mapped_column(
        String(50), default="PENDING", nullable=False
    )