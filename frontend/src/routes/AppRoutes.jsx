import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Factories from "../pages/Factories";
import ProtectedRoute from "./ProtectedRoute";
import Departments from "../pages/Departments";
import Workers from "../pages/Workers";
import Attendance from "../pages/Attendance";
import ProductionLines from "../pages/ProductionLines";
import Production from "../pages/Production";
import Machinery from "../pages/Machinery";
import Robotics from "../pages/Robotics";
import Maintenance from "../pages/Maintenance";
import RawMaterials from "../pages/RawMaterials";
import Suppliers from "../pages/Suppliers";
import Warehouses from "../pages/Warehouses";
import Inventory from "../pages/Inventory";
import Payroll from "../pages/Payroll";
import Expenses from "../pages/Expenses";
import QualityChecks from "../pages/QualityChecks";
import SafetyIncidents from "../pages/SafetyIncidents";
import Analytics from "../pages/Analytics";
import QRTracking from "../pages/QRTracking";
import IoTMonitoring from "../pages/IoTMonitoring";
import AIProduction from "../pages/AIProduction";
import FaceAttendance from "../pages/FaceAttendance";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/factories"
        element={
          <ProtectedRoute>
            <Factories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <Departments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workers"
        element={
          <ProtectedRoute>
            <Workers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/production-lines"
        element={
          <ProtectedRoute>
            <ProductionLines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/production"
        element={
          <ProtectedRoute>
            <Production />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machinery"
        element={
          <ProtectedRoute>
            <Machinery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/robotics"
        element={
          <ProtectedRoute>
            <Robotics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Maintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/raw-materials"
        element={
          <ProtectedRoute>
            <RawMaterials />
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <Suppliers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse"
        element={
          <ProtectedRoute>
            <Warehouses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <Payroll />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quality"
        element={
            <ProtectedRoute>
                <QualityChecks />
            </ProtectedRoute>
        }
    />

    <Route
        path="/safety"
        element={
          <ProtectedRoute>
            <SafetyIncidents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/qr-tracking"
        element={<QRTracking />}
      />

      <Route
        path="/iot-monitoring"
        element={<IoTMonitoring />}
      />

      <Route
        path="/ai-production"
        element={<AIProduction />}
      />

      <Route
        path="/face-attendance"
        element={<FaceAttendance />}
      />
    </Routes>
  );
}

export default AppRoutes;