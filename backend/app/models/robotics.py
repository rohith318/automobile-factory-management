from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Robotics(Base):
    __tablename__ = "robotics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    robot_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    robot_name: Mapped[str] = mapped_column(String(150), nullable=False)
    automation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"), nullable=False
    )
    maintenance_cycle_days: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    current_status: Mapped[str] = mapped_column(
        String(50), default="OPERATIONAL", nullable=False
    )