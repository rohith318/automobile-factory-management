from sqlalchemy.orm import Session

from app.models.machinery import Machinery

from app.repositories.machinery_repository import (
    create_machinery,
    delete_machinery,
    get_machinery,
    get_machinery_list,
    update_machinery,
)

from app.schemas.machinery import (
    MachineryCreate,
    MachineryMonitoringUpdate,
)


# =========================================================
# CREATE MACHINERY
# =========================================================

def create_machinery_service(
    db: Session,
    data: MachineryCreate,
) -> Machinery:

    machinery = Machinery(
        **data.model_dump()
    )

    return create_machinery(
        db,
        machinery,
    )


# =========================================================
# GET MACHINERY LIST
# =========================================================

def get_machinery_list_service(
    db: Session,
) -> list[Machinery]:

    return get_machinery_list(db)


# =========================================================
# GET SINGLE MACHINERY
# =========================================================

def get_machinery_service(
    db: Session,
    machinery_id: int,
) -> Machinery | None:

    return get_machinery(
        db,
        machinery_id,
    )


# =========================================================
# UPDATE MACHINERY
# =========================================================

def update_machinery_service(
    db: Session,
    machinery_id: int,
    data: MachineryCreate,
) -> Machinery | None:

    machinery = get_machinery(
        db,
        machinery_id,
    )

    if not machinery:
        return None

    for field, value in data.model_dump().items():
        setattr(
            machinery,
            field,
            value,
        )

    return update_machinery(
        db,
        machinery,
    )


# =========================================================
# DELETE MACHINERY
# =========================================================

def delete_machinery_service(
    db: Session,
    machinery_id: int,
) -> bool:

    machinery = get_machinery(
        db,
        machinery_id,
    )

    if not machinery:
        return False

    delete_machinery(
        db,
        machinery,
    )

    return True


# =========================================================
# MACHINE MONITORING
# =========================================================

def get_machine_monitoring_service(
    db: Session,
):

    machines = (
        db.query(Machinery)
        .order_by(Machinery.id)
        .all()
    )

    total_machines = len(machines)

    operational = sum(
        1
        for machine in machines
        if machine.machine_status.upper()
        == "OPERATIONAL"
    )

    maintenance = sum(
        1
        for machine in machines
        if machine.machine_status.upper()
        == "MAINTENANCE"
    )

    stopped = sum(
        1
        for machine in machines
        if machine.machine_status.upper()
        in ["STOPPED", "OFFLINE"]
    )

    total_running_hours = sum(
        machine.running_hours or 0
        for machine in machines
    )

    return {
        "total_machines": total_machines,
        "operational": operational,
        "maintenance": maintenance,
        "stopped": stopped,
        "total_running_hours": total_running_hours,
        "machines": [
            {
                "id": machine.id,
                "machine_code": machine.machine_code,
                "machine_name": machine.machine_name,
                "machine_type": machine.machine_type,
                "department_id": machine.department_id,
                "machine_status": machine.machine_status,
                "running_hours": machine.running_hours,
            }
            for machine in machines
        ],
    }


# =========================================================
# UPDATE MACHINE MONITORING DATA
# =========================================================

def update_machine_monitoring_service(
    db: Session,
    machinery_id: int,
    data: MachineryMonitoringUpdate,
) -> Machinery | None:

    machinery = get_machinery(
        db,
        machinery_id,
    )

    if not machinery:
        return None

    machinery.machine_status = data.machine_status
    machinery.running_hours = data.running_hours

    return update_machinery(
        db,
        machinery,
    )

# ==================================================
# PREDICTIVE MAINTENANCE
# ==================================================

def get_predictive_maintenance_service(db: Session):
    from app.models.maintenance import MaintenanceLog

    machines = get_machinery_list(db)

    results = []

    for machine in machines:

        # ------------------------------------------
        # Get maintenance history
        # ------------------------------------------

        maintenance_logs = (
            db.query(MaintenanceLog)
            .filter(
                MaintenanceLog.machine_id
                == machine.id
            )
            .all()
        )

        maintenance_count = len(
            maintenance_logs
        )

        total_maintenance_cost = sum(
            float(
                log.maintenance_cost or 0
            )
            for log in maintenance_logs
        )

        # ------------------------------------------
        # Running hours
        # ------------------------------------------

        running_hours = float(
            machine.running_hours or 0
        )

        # ------------------------------------------
        # Calculate risk
        # ------------------------------------------

        risk_score = 0
        recommendations = []

        # High running hours
        if running_hours >= 5000:
            risk_score += 50
            recommendations.append(
                "High running hours. Schedule maintenance immediately."
            )

        elif running_hours >= 3000:
            risk_score += 30
            recommendations.append(
                "Running hours are high. Maintenance should be scheduled soon."
            )

        elif running_hours >= 1500:
            risk_score += 15
            recommendations.append(
                "Monitor machine running hours."
            )

        # Maintenance history
        if maintenance_count >= 5:
            risk_score += 30
            recommendations.append(
                "Frequent maintenance history detected."
            )

        elif maintenance_count >= 3:
            risk_score += 20
            recommendations.append(
                "Multiple maintenance records detected."
            )

        elif maintenance_count >= 1:
            risk_score += 5

        # Machine status
        if machine.machine_status in [
            "MAINTENANCE",
            "STOPPED",
        ]:
            risk_score += 20
            recommendations.append(
                "Machine is currently not operating normally."
            )

        # ------------------------------------------
        # Risk level
        # ------------------------------------------

        if risk_score >= 60:
            risk_level = "HIGH"

        elif risk_score >= 30:
            risk_level = "MEDIUM"

        else:
            risk_level = "LOW"

        # ------------------------------------------
        # Default recommendation
        # ------------------------------------------

        if not recommendations:
            recommendations.append(
                "Machine condition appears normal. Continue regular monitoring."
            )

        results.append(
            {
                "machine_id": machine.id,
                "machine_code": machine.machine_code,
                "machine_name": machine.machine_name,
                "machine_type": machine.machine_type,
                "machine_status": machine.machine_status,
                "running_hours": running_hours,
                "maintenance_count": maintenance_count,
                "total_maintenance_cost": total_maintenance_cost,
                "risk_score": min(
                    risk_score,
                    100,
                ),
                "risk_level": risk_level,
                "recommendations": recommendations,
            }
        )

    return {
        "total_machines": len(results),
        "high_risk": len(
            [
                item
                for item in results
                if item["risk_level"] == "HIGH"
            ]
        ),
        "medium_risk": len(
            [
                item
                for item in results
                if item["risk_level"] == "MEDIUM"
            ]
        ),
        "low_risk": len(
            [
                item
                for item in results
                if item["risk_level"] == "LOW"
            ]
        ),
        "machines": results,
    }