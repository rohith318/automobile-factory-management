import { useEffect, useMemo, useState } from "react";

import {
  getMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceCostReport,
} from "../services/maintenanceService";

import { getRobotics } from "../services/roboticsService";
import { getMachinery } from "../services/machineryService";

function Maintenance() {
  const [records, setRecords] = useState([]);
  const [robots, setRobots] = useState([]);
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [costReport, setCostReport] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    machine_id: "",
    robot_id: "",
    maintenance_type: "",
    maintenance_cost: "",
    maintenance_date: "",
    technician_name: "",
    remarks: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [maintenanceData, robotData, machineData] =
        await Promise.all([
          getMaintenance(),
          getRobotics(),
          getMachinery(),
        ]);

      setRecords(maintenanceData);
      setRobots(robotData);
      setMachines(machineData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load maintenance records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // SUCCESS
  // ==========================================

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD
  // ==========================================

  const openAddForm = () => {
    setEditingRecord(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // ==========================================
  // EDIT
  // ==========================================

  const openEditForm = (record) => {
    setEditingRecord(record);

    setFormData({
      machine_id:
        record.machine_id !== null &&
        record.machine_id !== undefined
          ? String(record.machine_id)
          : "",

      robot_id:
        record.robot_id !== null &&
        record.robot_id !== undefined
          ? String(record.robot_id)
          : "",

      maintenance_type:
        record.maintenance_type || "",

      maintenance_cost:
        record.maintenance_cost !== null &&
        record.maintenance_cost !== undefined
          ? String(record.maintenance_cost)
          : "",

      maintenance_date:
        record.maintenance_date || "",

      technician_name:
        record.technician_name || "",

      remarks:
        record.remarks || "",
    });

    setError("");
    setShowForm(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingRecord(null);
    setFormData(emptyForm);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.maintenance_type.trim() ||
      !formData.maintenance_date ||
      !formData.technician_name.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (
      !formData.machine_id &&
      !formData.robot_id
    ) {
      setError(
        "Please select either a machine or a robot."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        machine_id: formData.machine_id
          ? Number(formData.machine_id)
          : null,

        robot_id: formData.robot_id
          ? Number(formData.robot_id)
          : null,

        maintenance_type:
          formData.maintenance_type.trim(),

        maintenance_cost:
          Number(formData.maintenance_cost) || 0,

        maintenance_date:
          formData.maintenance_date,

        technician_name:
          formData.technician_name.trim(),

        remarks:
          formData.remarks.trim() || null,
      };

      if (editingRecord) {
        await updateMaintenance(
          editingRecord.id,
          data
        );

        showSuccessMessage(
          "Maintenance record updated successfully."
        );
      } else {
        await createMaintenance(data);

        showSuccessMessage(
          "Maintenance record added successfully."
        );
      }

      closeForm();
      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Maintenance operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // VIEW
  // ==========================================

  const handleView = async (id) => {
    try {
      const data = await getMaintenanceById(id);

      setSelectedRecord(data);
      setShowDetails(true);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Failed to load maintenance details."
      );
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance record?"
    );

    if (!confirmed) return;

    try {
      await deleteMaintenance(record.id);

      showSuccessMessage(
        "Maintenance record deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete maintenance record."
      );
    }
  };

  // ==========================================
  // COST REPORT
  // ==========================================

  const handleCostReport = async () => {
    try {
      setError("");

      const data =
        await getMaintenanceCostReport();

      setCostReport(data);
      setShowReport(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load cost report."
      );
    }
  };

  // ==========================================
  // MACHINE / ROBOT NAME
  // ==========================================

  const getMachineName = (id) => {
    const machine = machines.find(
      (item) => item.id === id
    );

    return machine
      ? machine.machine_name
      : `Machine #${id}`;
  };

  const getRobotName = (id) => {
    const robot = robots.find(
      (item) => item.id === id
    );

    return robot
      ? robot.robot_name
      : `Robot #${id}`;
  };

  const getAssetName = (record) => {
    if (record.machine_id) {
      return getMachineName(record.machine_id);
    }

    if (record.robot_id) {
      return getRobotName(record.robot_id);
    }

    return "-";
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const assetName =
        getAssetName(record).toLowerCase();

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        assetName.includes(searchText) ||
        record.maintenance_type
          ?.toLowerCase()
          .includes(searchText) ||
        record.technician_name
          ?.toLowerCase()
          .includes(searchText);

      const matchesType =
        typeFilter === "All" ||
        record.maintenance_type ===
          typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    });
  }, [
    records,
    machines,
    robots,
    search,
    typeFilter,
  ]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRecords.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedRecords =
    filteredRecords.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalRecords = records.length;

  const totalCost = records.reduce(
    (sum, record) =>
      sum + Number(record.maintenance_cost || 0),
    0
  );

  const machineMaintenance = records.filter(
    (record) => record.machine_id
  ).length;

  const robotMaintenance = records.filter(
    (record) => record.robot_id
  ).length;

  // ==========================================
  // UI
  // ==========================================

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
              Maintenance Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage machine and robotics maintenance activities.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={handleCostReport}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
            >
              Cost Report
            </button>

            <button
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
            >
              + Add Maintenance
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
          <div className="mb-5 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Records"
            value={totalRecords}
          />

          <SummaryCard
            title="Total Maintenance Cost"
            value={`₹${totalCost.toLocaleString("en-IN")}`}
          />

          <SummaryCard
            title="Machine Maintenance"
            value={machineMaintenance}
          />

          <SummaryCard
            title="Robot Maintenance"
            value={robotMaintenance}
          />

        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 lg:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Search
              </label>

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Machine, robot, maintenance type or technician..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Maintenance Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Maintenance Types
                </option>

                <option value="PREVENTIVE">
                  Preventive
                </option>

                <option value="CORRECTIVE">
                  Corrective
                </option>

                <option value="BREAKDOWN">
                  Breakdown
                </option>

                <option value="INSPECTION">
                  Inspection
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* LIST */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Maintenance List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage maintenance records.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredRecords.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading maintenance records...
            </div>

          ) : filteredRecords.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No maintenance records found.
            </div>

          ) : (

            <>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        Asset
                      </th>

                      <th className="px-6 py-4">
                        Maintenance Type
                      </th>

                      <th className="px-6 py-4">
                        Cost
                      </th>

                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Technician
                      </th>

                      <th className="px-6 py-4">
                        Remarks
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedRecords.map(
                      (record) => (

                        <tr
                          key={record.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 font-semibold">
                            {getAssetName(record)}
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-md bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-400">
                              {
                                record.maintenance_type
                              }
                            </span>

                          </td>

                          <td className="px-6 py-4 font-semibold">
                            ₹
                            {Number(
                              record.maintenance_cost || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {record.maintenance_date}
                          </td>

                          <td className="px-6 py-4">
                            {
                              record.technician_name
                            }
                          </td>

                          <td className="max-w-[220px] truncate px-6 py-4 text-slate-400">
                            {record.remarks || "-"}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    record.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    record
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    record
                                  )
                                }
                                className="rounded-md border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">

                <span className="text-sm text-slate-500">
                  Page {safePage} of {totalPages}
                </span>

                <div className="flex gap-2">

                  <button
                    disabled={safePage === 1}
                    onClick={() =>
                      setCurrentPage(
                        safePage - 1
                      )
                    }
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    disabled={
                      safePage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        safePage + 1
                      )
                    }
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>

              </div>

            </>

          )}

        </div>

      </main>

      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs uppercase tracking-widest text-blue-400">
                  Maintenance
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingRecord
                    ? "Edit Maintenance"
                    : "Add Maintenance"}
                </h2>

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

              {/* MACHINE */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Machine
                </label>

                <select
                  name="machine_id"
                  value={formData.machine_id}
                  onChange={(e) => {
                    handleChange(e);

                    if (e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        robot_id: "",
                      }));
                    }
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                >

                  <option value="">
                    Select Machine
                  </option>

                  {machines.map((machine) => (
                    <option
                      key={machine.id}
                      value={machine.id}
                    >
                      {machine.machine_name}
                    </option>
                  ))}

                </select>

              </div>

              {/* ROBOT */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Robot
                </label>

                <select
                  name="robot_id"
                  value={formData.robot_id}
                  onChange={(e) => {
                    handleChange(e);

                    if (e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        machine_id: "",
                      }));
                    }
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                >

                  <option value="">
                    Select Robot
                  </option>

                  {robots.map((robot) => (
                    <option
                      key={robot.id}
                      value={robot.id}
                    >
                      {robot.robot_name}
                    </option>
                  ))}

                </select>

              </div>

              {/* TYPE */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Maintenance Type *
                </label>

                <select
                  name="maintenance_type"
                  value={
                    formData.maintenance_type
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                >

                  <option value="">
                    Select Type
                  </option>

                  <option value="PREVENTIVE">
                    Preventive
                  </option>

                  <option value="CORRECTIVE">
                    Corrective
                  </option>

                  <option value="BREAKDOWN">
                    Breakdown
                  </option>

                  <option value="INSPECTION">
                    Inspection
                  </option>

                </select>

              </div>

              {/* COST */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Maintenance Cost
                </label>

                <input
                  type="number"
                  min="0"
                  name="maintenance_cost"
                  value={
                    formData.maintenance_cost
                  }
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                />

              </div>

              {/* DATE */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Maintenance Date *
                </label>

                <input
                  type="date"
                  name="maintenance_date"
                  value={
                    formData.maintenance_date
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                />

              </div>

              {/* TECHNICIAN */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Technician Name *
                </label>

                <input
                  type="text"
                  name="technician_name"
                  value={
                    formData.technician_name
                  }
                  onChange={handleChange}
                  required
                  placeholder="Technician name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                />

              </div>

              {/* REMARKS */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">
                  Remarks
                </label>

                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Maintenance notes..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 md:col-span-2">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingRecord
                    ? "Update Maintenance"
                    : "Add Maintenance"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==========================================
          VIEW MODAL
      ========================================== */}

      {showDetails && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex justify-between">

              <div>

                <p className="text-xs uppercase tracking-widest text-blue-400">
                  Maintenance Record
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Maintenance Details
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="text-slate-400"
              >
                ✕
              </button>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <Detail
                label="Asset"
                value={getAssetName(
                  selectedRecord
                )}
              />

              <Detail
                label="Maintenance Type"
                value={
                  selectedRecord.maintenance_type
                }
              />

              <Detail
                label="Maintenance Cost"
                value={`₹${Number(
                  selectedRecord.maintenance_cost || 0
                ).toLocaleString("en-IN")}`}
              />

              <Detail
                label="Maintenance Date"
                value={
                  selectedRecord.maintenance_date
                }
              />

              <Detail
                label="Technician"
                value={
                  selectedRecord.technician_name
                }
              />

              <Detail
                label="Remarks"
                value={
                  selectedRecord.remarks || "-"
                }
              />

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          COST REPORT
      ========================================== */}

      {showReport && costReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex justify-between">

              <div>

                <p className="text-xs uppercase tracking-widest text-blue-400">
                  FINANCIAL REPORT
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Maintenance Cost Report
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Maintenance cost overview.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowReport(false)
                }
                className="text-slate-400"
              >
                ✕
              </button>

            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <SummaryCard
                title="Total Cost"
                value={`₹${Number(
                  costReport.total_cost ||
                    costReport.total_maintenance_cost ||
                    0
                ).toLocaleString("en-IN")}`}
              />

              <SummaryCard
                title="Maintenance Records"
                value={
                  costReport.total_records ??
                  totalRecords
                }
              />

              <SummaryCard
                title="Average Cost"
                value={`₹${Number(
                  costReport.average_cost ||
                    costReport.average_maintenance_cost ||
                    0
                ).toLocaleString("en-IN")}`}
              />

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={() =>
                  setShowReport(false)
                }
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold"
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

// ==========================================
// COMPONENTS
// ==========================================

function SummaryCard({ title, value }) {
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

function Detail({ label, value }) {
  return (
    <div className="border-b border-slate-800 pb-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

export default Maintenance;