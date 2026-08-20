from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class VehicleProduction(Base):
    __tablename__ = "vehicle_production"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vehicle_model: Mapped[str] = mapped_column(String(150), nullable=False)
    production_line_id: Mapped[int] = mapped_column(
        ForeignKey("production_lines.id"), nullable=False
    )
    chassis_number: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    production_stage: Mapped[str] = mapped_column(String(100), nullable=False)
    completion_status: Mapped[str] = mapped_column(
        String(50), default="IN_PROGRESS", nullable=False
    )
    production_cost: Mapped[float] = mapped_column(
        Float, default=0, nullable=False
    )