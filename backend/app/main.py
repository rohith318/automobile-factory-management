from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.workers import router as workers_router
from app.routers.machinery import router as machinery_router
from app.routers.robotics import router as robotics_router
from app.routers.production import router as production_router
from app.routers.production import analytics_router as production_analytics_router
from app.routers.expense import router as expense_router
from app.routers.expense import analytics_router as expense_analytics_router
from app.routers.maintenance import router as maintenance_router
from app.routers.attendance import router as attendance_router
from app.routers.supplier import router as supplier_router
from app.routers.raw_material import router as raw_material_router
from app.routers.production_line import router as production_line_router
from app.routers.quality_check import router as quality_check_router
from app.routers.warehouse import router as warehouse_router
from app.routers.factory import router as factory_router
from app.routers.payroll import router as payroll_router
from app.routers.iot import router as iot_router
from app.routers.department import router as department_router
from app.routers.notification import router as notification_router
from app.routers.qr_tracking import router as qr_tracking_router
from app.routers.safety_incident import router as safety_incident_router
from app.routers.inventory_transaction import (
    router as inventory_transaction_router,
)
from app.routers.production_prediction import (
    router as production_prediction_router,
)


app = FastAPI(
    title="Automobile Factory Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(factory_router)
app.include_router(department_router)
app.include_router(workers_router)
app.include_router(machinery_router)
app.include_router(robotics_router)
app.include_router(production_router)
app.include_router(production_analytics_router)
app.include_router(maintenance_router)
app.include_router(attendance_router)
app.include_router(supplier_router)
app.include_router(raw_material_router)
app.include_router(production_line_router)
app.include_router(quality_check_router)
app.include_router(warehouse_router)
app.include_router(payroll_router)
app.include_router(expense_router)
app.include_router(expense_analytics_router)
app.include_router(safety_incident_router)
app.include_router(inventory_transaction_router)
app.include_router(notification_router)
app.include_router(qr_tracking_router)
app.include_router(iot_router)
app.include_router(
    production_prediction_router
)


@app.get("/")
def root():
    return {
        "message": "Automobile Factory Management System API is running"
    }