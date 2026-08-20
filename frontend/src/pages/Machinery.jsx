
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import {
  getMachinery,
  getMachineryById,
  createMachinery,
  updateMachinery,
  deleteMachinery,
  getMachineMonitoring,
  getPredictiveMaintenance,
} from "../services/machineryService";

import {
  connectNotifications,
  disconnectNotifications,
} from "../services/notificationService";

import { getDepartments } from "../services/departmentService";

function Machinery() {
  const [machinery, setMachinery] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monitoringLoading, setMonitoringLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [monitoring, setMonitoring] = useState(null);

  // ==================================================
  // PREDICTIVE MAINTENANCE
  // ==================================================

  const [predictiveData, setPredictiveData] =
    useState(null);

  const [predictiveLoading, setPredictiveLoading] =
    useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingMachine, setEditingMachine] =
    useState(null);

  const [selectedMachine, setSelectedMachine] =
    useState(null);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    machine_code: "",
    machine_name: "",
    machine_type: "",
    department_id: "",
    purchase_date: "",
    warranty_expiry: "",
    machine_status: "OPERATIONAL",
    running_hours: "0",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        machineryData,
        departmentData,
      ] = await Promise.all([
        getMachinery(),
        getDepartments(),
      ]);

      setMachinery(machineryData || []);
      setDepartments(departmentData || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load machinery."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD MACHINE MONITORING
  // ==================================================

  const loadMonitoring = async () => {
    try {
      setMonitoringLoading(true);

      const data =
        await getMachineMonitoring();

      console.log(
        "Machine monitoring:",
        data
      );

      setMonitoring(data);
    } catch (error) {
      console.error(
        "Machine monitoring error:",
        error
      );
    } finally {
      setMonitoringLoading(false);
    }
  };

  // ==================================================
  // LOAD PREDICTIVE MAINTENANCE
  // ==================================================

  const loadPredictiveMaintenance = async () => {
    try {
      setPredictiveLoading(true);

      const data = await getPredictiveMaintenance();

      console.log("Predictive maintenance:", data);

      setPredictiveData(data);
    } catch (error) {
      console.error("Predictive maintenance error:", error);
    } finally {
      setPredictiveLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadData();
    loadMonitoring();
    loadPredictiveMaintenance();
  }, []);

  // ==================================================
  // WEBSOCKET REAL-TIME MONITORING
  // ==================================================

  useEffect(() => {
    let socket;

    try {
      socket = connectNotifications(
        (notification) => {
          console.log(
            "Machinery notification:",
            notification
          );

          if (
            notification?.type ===
              "MACHINE_ALERT" ||
            notification?.type ===
              "MACHINE_MONITORING" ||
            notification?.type ===
              "MAINTENANCE"
          ) {
            loadData();
            loadMonitoring();
            loadPredictiveMaintenance();
          }
        }
      );
    } catch (error) {
      console.error(
        "WebSocket connection error:",
        error
      );
    }

    return () => {
      if (socket) {
        disconnectNotifications();
      }
    };
  }, []);

  // ==================================================
  // SUCCESS MESSAGE
  // ==================================================

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==================================================
  // ADD
  // ==================================================

  const openAddForm = () => {
    setEditingMachine(null);
    setFormData({
      ...emptyForm,
    });
    setError("");
    setShowForm(true);
  };

  // ==================================================
  // EDIT
  // ==================================================

  const openEditForm = (machine) => {
    setEditingMachine(machine);

    setFormData({
      machine_code:
        machine.machine_code || "",

      machine_name:
        machine.machine_name || "",

      machine_type:
        machine.machine_type || "",

      department_id:
        machine.department_id
          ? String(machine.department_id)
          : "",

      purchase_date:
        machine.purchase_date || "",

      warranty_expiry:
        machine.warranty_expiry || "",

      machine_status:
        machine.machine_status ||
        "OPERATIONAL",

      running_hours:
        machine.running_hours !== undefined &&
        machine.running_hours !== null
          ? String(machine.running_hours)
          : "0",
    });

    setError("");
    setShowForm(true);
  };

  // ==================================================
  // CLOSE FORM
  // ==================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingMachine(null);

    setFormData({
      ...emptyForm,
    });
  };

  // ==================================================
  // CREATE / UPDATE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.machine_code.trim() ||
      !formData.machine_name.trim() ||
      !formData.machine_type.trim() ||
      !formData.department_id ||
      !formData.purchase_date
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    const runningHours = Number(
      formData.running_hours || 0
    );

    if (runningHours < 0) {
      setError(
        "Running hours cannot be negative."
      );

      return;
    }

    if (
      formData.warranty_expiry &&
      formData.warranty_expiry <
        formData.purchase_date
    ) {
      setError(
        "Warranty expiry cannot be before purchase date."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        machine_code:
          formData.machine_code.trim(),

        machine_name:
          formData.machine_name.trim(),

        machine_type:
          formData.machine_type.trim(),

        department_id: Number(
          formData.department_id
        ),

        purchase_date:
          formData.purchase_date,

        warranty_expiry:
          formData.warranty_expiry ||
          null,

        machine_status:
          formData.machine_status,

        running_hours: runningHours,
      };

      if (editingMachine) {
        await updateMachinery(
          editingMachine.id,
          data
        );

        showSuccessMessage(
          "Machinery updated successfully."
        );
      } else {
        await createMachinery(data);

        showSuccessMessage(
          "Machinery added successfully."
        );
      }

      closeForm();

      await loadData();
      await loadMonitoring();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Machinery operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // VIEW
  // ==================================================

  const handleView = async (machineId) => {
    try {
      setError("");

      const data =
        await getMachineryById(machineId);

      setSelectedMachine(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load machinery details."
      );
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async (machine) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${machine.machine_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteMachinery(machine.id);

      showSuccessMessage(
        "Machinery deleted successfully."
      );

      await loadData();
      await loadMonitoring();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete machinery."
      );
    }
  };

  // ==================================================
  // DEPARTMENT NAME
  // ==================================================

  const getDepartmentName = (
    departmentId
  ) => {
    const department =
      departments.find(
        (item) =>
          item.id === departmentId
      );

    return department
      ? department.department_name
      : `Department #${departmentId}`;
  };

  // ==================================================
  // WARRANTY STATUS
  // ==================================================

  const getWarrantyStatus = (
    warrantyExpiry
  ) => {
    if (!warrantyExpiry) {
      return {
        label: "Not Available",
        className:
          "bg-slate-800 text-slate-400",
      };
    }

    const today = new Date();

    const expiry = new Date(
      warrantyExpiry
    );

    if (expiry < today) {
      return {
        label: "Expired",
        className:
          "bg-red-950 text-red-400",
      };
    }

    return {
      label: "Valid",
      className:
        "bg-green-950 text-green-400",
    };
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredMachinery = useMemo(() => {
    return machinery.filter((machine) => {
      const searchText =
        search.toLowerCase();

      const departmentName =
        getDepartmentName(
          machine.department_id
        ).toLowerCase();

      const matchesSearch =
        machine.machine_code
          ?.toLowerCase()
          .includes(searchText) ||
        machine.machine_name
          ?.toLowerCase()
          .includes(searchText) ||
        machine.machine_type
          ?.toLowerCase()
          .includes(searchText) ||
        departmentName.includes(
          searchText
        );

      const matchesDepartment =
        departmentFilter === "All" ||
        String(
          machine.department_id
        ) === String(
          departmentFilter
        );

      const matchesStatus =
        statusFilter === "All" ||
        machine.machine_status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    machinery,
    departments,
    search,
    departmentFilter,
    statusFilter,
  ]);

  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMachinery.length /
        itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const paginatedMachinery =
    filteredMachinery.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // ==================================================
  // LOCAL SUMMARY
  // ==================================================

  const totalMachines =
    machinery.length;

  const operationalMachines =
    machinery.filter(
      (machine) =>
        machine.machine_status ===
        "OPERATIONAL"
    ).length;

  const maintenanceMachines =
    machinery.filter(
      (machine) =>
        machine.machine_status ===
        "MAINTENANCE"
    ).length;

  const inactiveMachines =
    machinery.filter(
      (machine) =>
        machine.machine_status ===
        "INACTIVE"
    ).length;

  const totalRunningHours =
    machinery.reduce(
      (total, machine) =>
        total +
        Number(
          machine.running_hours || 0
        ),
      0
    );

  // ==================================================
  // MONITORING VALUES
  // ==================================================

  const monitoringMachines =
    Array.isArray(
      monitoring?.machines
    )
      ? monitoring.machines
      : machinery;

  const monitoringTotal =
    monitoring?.total_machines ??
    monitoring?.total ??
    monitoringMachines.length ??
    totalMachines;

  const monitoringOperational =
    monitoring?.operational ??
    monitoring?.operational_machines ??
    monitoringMachines.filter(
      (machine) =>
        machine.machine_status ===
        "OPERATIONAL"
    ).length ??
    operationalMachines;

  const monitoringMaintenance =
    monitoring?.maintenance ??
    monitoring?.maintenance_machines ??
    monitoringMachines.filter(
      (machine) =>
        machine.machine_status ===
        "MAINTENANCE"
    ).length ??
    maintenanceMachines;

  const monitoringStopped =
    monitoring?.stopped ??
    monitoring?.stopped_machines ??
    monitoringMachines.filter(
      (machine) =>
        machine.machine_status ===
        "INACTIVE" ||
        machine.machine_status ===
        "STOPPED"
    ).length ??
    inactiveMachines;

  const monitoringRunningHours =
    monitoring?.total_running_hours ??
    monitoring?.running_hours ??
    monitoringMachines.reduce(
      (total, machine) =>
        total +
        Number(
          machine.running_hours || 0
        ),
      0
    );

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              OPERATIONS
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Machinery Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage factory machinery, operating status and running hours.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={loadMonitoring}
              disabled={monitoringLoading}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {monitoringLoading
                ? "Refreshing..."
                : "↻ Refresh Monitoring"}
            </button>

            <button
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
            >
              + Add Machinery
            </button>

          </div>

        </div>

      </header>

      <main className="p-6 lg:p-8">

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-800 bg-green-950/40 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex justify-between rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-4"
            >
              ✕
            </button>

          </div>
        )}

        {/* ==================================================
            REAL-TIME MONITORING
        ================================================== */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                LIVE MONITORING
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Real-Time Machine Monitoring
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Monitor the current operating condition of factory machinery.
              </p>

            </div>

            <div className="flex items-center gap-2 rounded-full border border-green-800 bg-green-950/30 px-3 py-1.5 text-xs font-semibold text-green-400">

              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>

              LIVE

            </div>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

            <MonitoringCard
              title="Total Machines"
              value={monitoringTotal}
              icon="⚙️"
            />

            <MonitoringCard
              title="Operational"
              value={monitoringOperational}
              icon="🟢"
              valueClass="text-green-400"
            />

            <MonitoringCard
              title="Maintenance"
              value={monitoringMaintenance}
              icon="🔧"
              valueClass="text-yellow-400"
            />

            <MonitoringCard
              title="Stopped"
              value={monitoringStopped}
              icon="🔴"
              valueClass="text-red-400"
            />

            <MonitoringCard
              title="Running Hours"
              value={`${Number(
                monitoringRunningHours || 0
              ).toLocaleString(
                "en-IN"
              )} hrs`}
              icon="⏱️"
            />

          </div>

        </div>

        {/* ==================================================
            LIVE MACHINE STATUS
        ================================================== */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Live Machine Status
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Current operating status of factory machines.
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-green-400">

              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>

              LIVE

            </div>

          </div>

          {monitoringLoading ? (

            <div className="p-10 text-center text-slate-400">
              Loading machine monitoring...
            </div>

          ) : monitoringMachines.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              No machine monitoring data available.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left text-sm">

                <thead className="border-b border-slate-800 text-slate-400">

                  <tr>

                    <th className="px-6 py-4">
                      Machine
                    </th>

                    <th className="px-6 py-4">
                      Code
                    </th>

                    <th className="px-6 py-4">
                      Type
                    </th>

                    <th className="px-6 py-4">
                      Department
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Running Hours
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {monitoringMachines.map(
                    (machine) => (

                      <tr
                        key={machine.id}
                        className="border-b border-slate-800 hover:bg-slate-800/40"
                      >

                        <td className="px-6 py-4 font-semibold">
                          {machine.machine_name}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {machine.machine_code}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {machine.machine_type}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {getDepartmentName(
                            machine.department_id
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <StatusBadge
                            status={
                              machine.machine_status
                            }
                          />

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <span>
                              {Number(
                                machine.running_hours ||
                                0
                              ).toLocaleString(
                                "en-IN"
                              )}{" "}
                              hrs
                            </span>

                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${Math.min(
                                    (Number(
                                      machine.running_hours ||
                                      0
                                    ) / 1000) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* ==================================================
            PREDICTIVE MAINTENANCE
        ================================================== */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                AI / PREDICTION
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Predictive Maintenance
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Identify machines that may require maintenance based on running hours and maintenance history.
              </p>
            </div>

            <button
              onClick={loadPredictiveMaintenance}
              disabled={predictiveLoading}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {predictiveLoading ? "Analyzing..." : "↻ Refresh Prediction"}
            </button>

          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <PredictiveCard
              title="Total Machines"
              value={predictiveData?.total_machines ?? 0}
              icon="⚙️"
              valueClass="text-blue-400"
            />

            <PredictiveCard
              title="High Risk"
              value={predictiveData?.high_risk ?? 0}
              icon="🔴"
              valueClass="text-red-400"
            />

            <PredictiveCard
              title="Medium Risk"
              value={predictiveData?.medium_risk ?? 0}
              icon="🟡"
              valueClass="text-yellow-400"
            />

            <PredictiveCard
              title="Low Risk"
              value={predictiveData?.low_risk ?? 0}
              icon="🟢"
              valueClass="text-green-400"
            />
          </div>

          <div className="border-t border-slate-800">

            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold">
                Machine Risk Analysis
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Risk is calculated from machine usage, maintenance history and current machine status.
              </p>
            </div>

            {predictiveLoading ? (
              <div className="px-6 pb-8 text-center text-slate-400">
                Analyzing machine maintenance risk...
              </div>
            ) : !predictiveData?.machines?.length ? (
              <div className="px-6 pb-8 text-center text-slate-500">
                No predictive maintenance data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead className="border-y border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Machine</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Running Hours</th>
                      <th className="px-6 py-4">Maintenance Records</th>
                      <th className="px-6 py-4">Maintenance Cost</th>
                      <th className="px-6 py-4">Risk Score</th>
                      <th className="px-6 py-4">Risk Level</th>
                      <th className="px-6 py-4">Recommendation</th>
                    </tr>
                  </thead>

                  <tbody>
                    {predictiveData.machines.map((machine) => (
                      <tr
                        key={machine.machine_id}
                        className="border-b border-slate-800 hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold">{machine.machine_name}</p>
                          <p className="mt-1 font-mono text-xs text-slate-500">
                            {machine.machine_code}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={machine.machine_status} />
                        </td>

                        <td className="px-6 py-5">
                          {Number(machine.running_hours || 0).toLocaleString("en-IN")} hrs
                        </td>

                        <td className="px-6 py-5">
                          {machine.maintenance_count ?? 0}
                        </td>

                        <td className="px-6 py-5">
                          ₹{Number(machine.total_maintenance_cost || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">
                              {machine.risk_score ?? 0}%
                            </span>

                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={`h-full rounded-full ${
                                  machine.risk_level === "HIGH"
                                    ? "bg-red-500"
                                    : machine.risk_level === "MEDIUM"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(Number(machine.risk_score || 0), 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <RiskBadge level={machine.risk_level} />
                        </td>

                        <td className="max-w-md px-6 py-5 text-xs text-slate-400">
                          {machine.recommendations?.length
                            ? machine.recommendations.join(" ")
                            : "Continue regular monitoring."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            EXISTING SUMMARY
        ================================================== */}

        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total Machinery"
            value={totalMachines}
          />

          <SummaryCard
            title="Operational"
            value={operationalMachines}
          />

          <SummaryCard
            title="Maintenance"
            value={maintenanceMachines}
          />

          <SummaryCard
            title="Running Hours"
            value={`${totalRunningHours.toLocaleString(
              "en-IN"
            )} hrs`}
          />

        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 xl:grid-cols-3">

            {/* SEARCH */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                placeholder="Machine code, name or type..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            {/* DEPARTMENT */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Department
              </label>

              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Departments
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {
                        department.department_name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STATUS */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Machine Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Status
                </option>

                <option value="OPERATIONAL">
                  Operational
                </option>

                <option value="MAINTENANCE">
                  Maintenance
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

                <option value="STOPPED">
                  Stopped
                </option>

              </select>

            </div>

          </div>

          {(search ||
            departmentFilter !== "All" ||
            statusFilter !== "All") && (

            <button
              onClick={() => {
                setSearch("");
                setDepartmentFilter("All");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Filters
            </button>

          )}

        </div>

        {/* ==================================================
            MACHINERY LIST
        ================================================== */}

        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Machinery List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered factory machinery.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredMachinery.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading machinery...
            </div>

          ) : filteredMachinery.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No machinery found.
            </div>

          ) : (

            <>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1200px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        Machine Code
                      </th>

                      <th className="px-6 py-4">
                        Machine Name
                      </th>

                      <th className="px-6 py-4">
                        Type
                      </th>

                      <th className="px-6 py-4">
                        Department
                      </th>

                      <th className="px-6 py-4">
                        Purchase Date
                      </th>

                      <th className="px-6 py-4">
                        Running Hours
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Warranty
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedMachinery.map(
                      (machine) => {

                        const warranty =
                          getWarrantyStatus(
                            machine.warranty_expiry
                          );

                        return (
                          <tr
                            key={machine.id}
                            className="border-b border-slate-800 hover:bg-slate-800/40"
                          >

                            <td className="px-6 py-4 font-mono text-xs font-semibold">
                              {machine.machine_code}
                            </td>

                            <td className="px-6 py-4 font-semibold">
                              {machine.machine_name}
                            </td>

                            <td className="px-6 py-4 text-slate-400">
                              {machine.machine_type}
                            </td>

                            <td className="px-6 py-4 text-slate-400">
                              {getDepartmentName(
                                machine.department_id
                              )}
                            </td>

                            <td className="px-6 py-4 text-slate-400">
                              {formatDate(
                                machine.purchase_date
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {Number(
                                machine.running_hours ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}{" "}
                              hrs
                            </td>

                            <td className="px-6 py-4">

                              <StatusBadge
                                status={
                                  machine.machine_status
                                }
                              />

                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${warranty.className}`}
                              >
                                {warranty.label}
                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <div className="flex gap-2">

                                <button
                                  onClick={() =>
                                    handleView(
                                      machine.id
                                    )
                                  }
                                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                                >
                                  View
                                </button>

                                <button
                                  onClick={() =>
                                    openEditForm(
                                      machine
                                    )
                                  }
                                  className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      machine
                                    )
                                  }
                                  className="rounded-md border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950"
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* PAGINATION */}

              <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">

                <span className="text-sm text-slate-500">
                  Page {safeCurrentPage} of{" "}
                  {totalPages}
                </span>

                <div className="flex gap-2">

                  <button
                    disabled={
                      safeCurrentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        safeCurrentPage - 1
                      )
                    }
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40 hover:bg-slate-800"
                  >
                    Previous
                  </button>

                  <button
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        safeCurrentPage + 1
                      )
                    }
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40 hover:bg-slate-800"
                  >
                    Next
                  </button>

                </div>

              </div>

            </>

          )}

        </div>

      </main>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Machinery
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingMachine
                    ? "Edit Machinery"
                    : "Add Machinery"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter machine information and operational details.
                </p>

              </div>

              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >

              <FormInput
                label="Machine Code"
                name="machine_code"
                value={
                  formData.machine_code
                }
                onChange={handleChange}
                placeholder="MCH-2026-001"
                required
              />

              <FormInput
                label="Machine Name"
                name="machine_name"
                value={
                  formData.machine_name
                }
                onChange={handleChange}
                placeholder="CNC Milling Machine"
                required
              />

              <FormInput
                label="Machine Type"
                name="machine_type"
                value={
                  formData.machine_type
                }
                onChange={handleChange}
                placeholder="CNC"
                required
              />

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Department
                </label>

                <select
                  name="department_id"
                  value={
                    formData.department_id
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (

                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {
                          department.department_name
                        }
                      </option>

                    )
                  )}

                </select>

              </div>

              <FormInput
                label="Purchase Date"
                name="purchase_date"
                type="date"
                value={
                  formData.purchase_date
                }
                onChange={handleChange}
                required
              />

              <FormInput
                label="Warranty Expiry"
                name="warranty_expiry"
                type="date"
                value={
                  formData.warranty_expiry
                }
                onChange={handleChange}
              />

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Machine Status
                </label>

                <select
                  name="machine_status"
                  value={
                    formData.machine_status
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="OPERATIONAL">
                    Operational
                  </option>

                  <option value="MAINTENANCE">
                    Maintenance
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>

                  <option value="STOPPED">
                    Stopped
                  </option>

                </select>

              </div>

              <FormInput
                label="Running Hours"
                name="running_hours"
                type="number"
                min="0"
                step="0.1"
                value={
                  formData.running_hours
                }
                onChange={handleChange}
                placeholder="1250"
              />

              <div className="flex justify-end gap-3 pt-3 md:col-span-2">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingMachine
                    ? "Update Machinery"
                    : "Add Machinery"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ==================================================
          VIEW DETAILS
      ================================================== */}

      {showDetails &&
        selectedMachine && (

          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Machinery Details
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {
                      selectedMachine.machine_name
                    }
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowDetails(false)
                  }
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <DetailRow
                  label="Machine ID"
                  value={
                    selectedMachine.id
                  }
                />

                <DetailRow
                  label="Machine Code"
                  value={
                    selectedMachine.machine_code
                  }
                />

                <DetailRow
                  label="Machine Name"
                  value={
                    selectedMachine.machine_name
                  }
                />

                <DetailRow
                  label="Machine Type"
                  value={
                    selectedMachine.machine_type
                  }
                />

                <DetailRow
                  label="Department"
                  value={getDepartmentName(
                    selectedMachine.department_id
                  )}
                />

                <DetailRow
                  label="Purchase Date"
                  value={formatDate(
                    selectedMachine.purchase_date
                  )}
                />

                <DetailRow
                  label="Warranty Expiry"
                  value={
                    selectedMachine.warranty_expiry
                      ? formatDate(
                          selectedMachine.warranty_expiry
                        )
                      : "Not Available"
                  }
                />

                <DetailRow
                  label="Running Hours"
                  value={`${Number(
                    selectedMachine.running_hours ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )} hrs`}
                />

                <DetailRow
                  label="Machine Status"
                  value={
                    selectedMachine.machine_status
                  }
                />

              </div>

              <div className="mt-6 flex justify-end">

                <button
                  onClick={() =>
                    setShowDetails(false)
                  }
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

// ==================================================
// PREDICTIVE CARD
// ==================================================

function PredictiveCard({
  title,
  value,
  icon,
  valueClass = "text-blue-400",
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>

      <p className={`mt-3 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

// ==================================================
// RISK BADGE
// ==================================================

function RiskBadge({ level }) {
  const styles = {
    HIGH: "border-red-900 bg-red-950 text-red-400",
    MEDIUM: "border-yellow-900 bg-yellow-950 text-yellow-400",
    LOW: "border-green-900 bg-green-950 text-green-400",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[level] || "border-slate-700 bg-slate-800 text-slate-400"
      }`}
    >
      {level || "UNKNOWN"}
    </span>
  );
}

// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-blue-400">
        {value}
      </p>

    </div>
  );
}

// ==================================================
// MONITORING CARD
// ==================================================

function MonitoringCard({
  title,
  value,
  icon,
  valueClass = "text-blue-400",
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-400">
          {title}
        </p>

        <span className="text-lg">
          {icon}
        </span>

      </div>

      <p
        className={`mt-3 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}

// ==================================================
// FORM INPUT
// ==================================================

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  step,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">

        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />

    </div>
  );
}

// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({ status }) {
  const styles = {
    OPERATIONAL:
      "bg-green-950 text-green-400",

    MAINTENANCE:
      "bg-yellow-950 text-yellow-400",

    INACTIVE:
      "bg-slate-800 text-slate-400",

    STOPPED:
      "bg-red-950 text-red-400",
  };

  const labels = {
    OPERATIONAL: "Operational",
    MAINTENANCE: "Maintenance",
    INACTIVE: "Inactive",
    STOPPED: "Stopped",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-slate-800 text-slate-300"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// ==================================================
// DETAIL ROW
// ==================================================

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="border-b border-slate-800 pb-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white">
        {value ?? "-"}
      </p>

    </div>
  );
}

// ==================================================
// DATE FORMAT
// ==================================================

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN"
  );
}

export default Machinery;