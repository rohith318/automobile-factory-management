from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    machine_id: Mapped[int | None] = mapped_column(
        ForeignKey("machinery.id"), nullable=True
    )
    robot_id: Mapped[int | None] = mapped_column(
        ForeignKey("robotics.id"), nullable=True
    )
    maintenance_type: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    maintenance_cost: Mapped[float] = mapped_column(
        Float, default=0, nullable=False
    )
    maintenance_date: Mapped[date] = mapped_column(Date, nullable=False)
    technician_name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)