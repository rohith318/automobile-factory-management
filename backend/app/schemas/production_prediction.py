from pydantic import BaseModel


class ProductionPredictionResponse(BaseModel):
    production_line_id: int
    line_name: str

    target_per_day: float
    current_output: float

    efficiency_percentage: float
    predicted_output: float

    expected_completion_percentage: float
    remaining_units: float

    prediction_status: str
    recommendation: str