from sqlalchemy.orm import Session

from app.models.production_line import ProductionLine


def get_production_prediction_service(
    db: Session,
):
    production_lines = (
        db.query(ProductionLine)
        .all()
    )

    predictions = []

    for line in production_lines:

        target = float(
            line.target_per_day or 0
        )

        current_output = float(
            line.current_output or 0
        )

        # ------------------------------------------
        # Efficiency
        # ------------------------------------------

        if target > 0:
            efficiency = (
                current_output / target
            ) * 100
        else:
            efficiency = 0

        efficiency = round(
            min(efficiency, 100),
            2,
        )

        # ------------------------------------------
        # Production prediction
        #
        # Project next output using the current
        # production performance.
        # ------------------------------------------

        if current_output > 0:

            if efficiency >= 90:
                predicted_output = (
                    current_output * 1.10
                )

            elif efficiency >= 70:
                predicted_output = (
                    current_output * 1.05
                )

            elif efficiency >= 50:
                predicted_output = (
                    current_output * 0.95
                )

            else:
                predicted_output = (
                    current_output * 0.85
                )

        else:
            predicted_output = 0

        predicted_output = round(
            predicted_output,
            2,
        )

        # ------------------------------------------
        # Expected completion
        # ------------------------------------------

        if target > 0:
            completion = (
                predicted_output / target
            ) * 100
        else:
            completion = 0

        completion = round(
            min(completion, 100),
            2,
        )

        # ------------------------------------------
        # Remaining production
        # ------------------------------------------

        remaining_units = max(
            target - predicted_output,
            0,
        )

        remaining_units = round(
            remaining_units,
            2,
        )

        # ------------------------------------------
        # Prediction status
        # ------------------------------------------

        if efficiency >= 90:

            prediction_status = "EXCELLENT"

            recommendation = (
                "Production line is performing "
                "above target. Maintain the current "
                "production rate."
            )

        elif efficiency >= 70:

            prediction_status = "GOOD"

            recommendation = (
                "Production performance is good. "
                "Continue monitoring output."
            )

        elif efficiency >= 50:

            prediction_status = "MODERATE"

            recommendation = (
                "Production is below target. "
                "Consider improving line efficiency."
            )

        else:

            prediction_status = "LOW"

            recommendation = (
                "Production is significantly below "
                "target. Immediate operational review "
                "is recommended."
            )

        predictions.append(
            {
                "production_line_id": line.id,
                "line_name": line.line_name,
                "target_per_day": target,
                "current_output": current_output,
                "efficiency_percentage": efficiency,
                "predicted_output": predicted_output,
                "expected_completion_percentage": completion,
                "remaining_units": remaining_units,
                "prediction_status": prediction_status,
                "recommendation": recommendation,
            }
        )

    # ------------------------------------------
    # Overall summary
    # ------------------------------------------

    total_target = sum(
        item["target_per_day"]
        for item in predictions
    )

    total_current = sum(
        item["current_output"]
        for item in predictions
    )

    total_predicted = sum(
        item["predicted_output"]
        for item in predictions
    )

    if total_target > 0:
        overall_efficiency = (
            total_current / total_target
        ) * 100
    else:
        overall_efficiency = 0

    if total_target > 0:
        overall_completion = (
            total_predicted / total_target
        ) * 100
    else:
        overall_completion = 0

    return {
        "total_production_lines": len(
            predictions
        ),
        "total_target": round(
            total_target,
            2,
        ),
        "total_current_output": round(
            total_current,
            2,
        ),
        "total_predicted_output": round(
            total_predicted,
            2,
        ),
        "overall_efficiency": round(
            min(overall_efficiency, 100),
            2,
        ),
        "overall_completion": round(
            min(overall_completion, 100),
            2,
        ),
        "predictions": predictions,
    }


def get_production_line_prediction_service(
    db: Session,
    production_line_id: int,
):
    production_line = (
        db.query(ProductionLine)
        .filter(
            ProductionLine.id
            == production_line_id
        )
        .first()
    )

    if not production_line:
        return None

    target = float(
        production_line.target_per_day or 0
    )

    current_output = float(
        production_line.current_output or 0
    )

    if target > 0:
        efficiency = (
            current_output / target
        ) * 100
    else:
        efficiency = 0

    efficiency = round(
        min(efficiency, 100),
        2,
    )

    if efficiency >= 90:
        predicted_output = current_output * 1.10
        status = "EXCELLENT"

    elif efficiency >= 70:
        predicted_output = current_output * 1.05
        status = "GOOD"

    elif efficiency >= 50:
        predicted_output = current_output * 0.95
        status = "MODERATE"

    else:
        predicted_output = current_output * 0.85
        status = "LOW"

    predicted_output = round(
        predicted_output,
        2,
    )

    if target > 0:
        completion = (
            predicted_output / target
        ) * 100
    else:
        completion = 0

    return {
        "production_line_id": production_line.id,
        "line_name": production_line.line_name,
        "target_per_day": target,
        "current_output": current_output,
        "efficiency_percentage": efficiency,
        "predicted_output": predicted_output,
        "expected_completion_percentage": round(
            min(completion, 100),
            2,
        ),
        "remaining_units": round(
            max(
                target - predicted_output,
                0,
            ),
            2,
        ),
        "prediction_status": status,
    }