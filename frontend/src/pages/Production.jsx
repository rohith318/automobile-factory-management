import { useEffect, useMemo, useState } from "react";

import {
  createProduction,
  deleteProduction,
  getLiveProductionStatus,
  getProduction,
  getProductionAnalytics,
  getProductions,
  updateProduction,
} from "../services/productionService";

import { getProductionLines } from "../services/productionLineService";

function Production() {
  const [productions, setProductions] = useState([]);
  const [productionLines, setProductionLines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showLiveStatus, setShowLiveStatus] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [editingProduction, setEditingProduction] =
    useState(null);

  const [selectedProduction, setSelectedProduction] =
    useState(null);

  const [liveStatus, setLiveStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    vehicle_model: "",
    production_line_id: "",
    chassis_number: "",
    production_stage: "",
    completion_status: "IN_PROGRESS",
    production_cost: "0",
  };

  const [formData, setFormData] = useState(emptyForm);

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productionData, lineData] =
        await Promise.all([
          getProductions(),
          getProductionLines(),
        ]);

      setProductions(productionData);
      setProductionLines(lineData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load production records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    setEditingProduction(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // ==================================================
  // EDIT
  // ==================================================

  const openEditForm = (production) => {
    setEditingProduction(production);

    setFormData({
      vehicle_model:
        production.vehicle_model || "",

      production_line_id:
        production.production_line_id
          ? String(
              production.production_line_id
            )
          : "",

      chassis_number:
        production.chassis_number || "",

      production_stage:
        production.production_stage || "",

      completion_status:
        production.completion_status ||
        "IN_PROGRESS",

      production_cost:
        production.production_cost !==
          undefined &&
        production.production_cost !== null
          ? String(production.production_cost)
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
    setEditingProduction(null);
    setFormData(emptyForm);
  };

  // ==================================================
  // CREATE / UPDATE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.vehicle_model.trim() ||
      !formData.production_line_id ||
      !formData.chassis_number.trim() ||
      !formData.production_stage.trim()
    ) {
      setError(
        "Vehicle model, production line, chassis number and production stage are required."
      );
      return;
    }

    const productionCost = Number(
      formData.production_cost || 0
    );

    if (productionCost < 0) {
      setError(
        "Production cost cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        vehicle_model:
          formData.vehicle_model.trim(),

        production_line_id: Number(
          formData.production_line_id
        ),

        chassis_number:
          formData.chassis_number.trim(),

        production_stage:
          formData.production_stage.trim(),

        completion_status:
          formData.completion_status,

        production_cost: productionCost,
      };

      if (editingProduction) {
        await updateProduction(
          editingProduction.id,
          data
        );

        showSuccessMessage(
          "Production record updated successfully."
        );
      } else {
        await createProduction(data);

        showSuccessMessage(
          "Production record created successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Production operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // VIEW
  // ==================================================

  const handleView = async (productionId) => {
    try {
      setError("");

      const data = await getProduction(
        productionId
      );

      setSelectedProduction(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load production details."
      );
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async (production) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete production record for "${production.vehicle_model}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProduction(production.id);

      showSuccessMessage(
        "Production record deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete production record."
      );
    }
  };

  // ==================================================
  // PRODUCTION LINE NAME
  // ==================================================

  const getLineName = (lineId) => {
    const line = productionLines.find(
      (item) => item.id === lineId
    );

    return line
      ? line.line_name
      : `Line #${lineId}`;
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredProductions = useMemo(() => {
    return productions.filter((production) => {
      const searchText = search.toLowerCase();

      const lineName = getLineName(
        production.production_line_id
      ).toLowerCase();

      const matchesSearch =
        production.vehicle_model
          ?.toLowerCase()
          .includes(searchText) ||
        production.chassis_number
          ?.toLowerCase()
          .includes(searchText) ||
        production.production_stage
          ?.toLowerCase()
          .includes(searchText) ||
        lineName.includes(searchText);

      const matchesLine =
        lineFilter === "All" ||
        String(
          production.production_line_id
        ) === String(lineFilter);

      const matchesStage =
        stageFilter === "All" ||
        production.production_stage ===
          stageFilter;

      const matchesStatus =
        statusFilter === "All" ||
        production.completion_status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesLine &&
        matchesStage &&
        matchesStatus
      );
    });
  }, [
    productions,
    productionLines,
    search,
    lineFilter,
    stageFilter,
    statusFilter,
  ]);

  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProductions.length /
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

  const paginatedProductions =
    filteredProductions.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalVehicles =
    productions.length;

  const inProgressCount =
    productions.filter(
      (item) =>
        item.completion_status ===
        "IN_PROGRESS"
    ).length;

  const completedCount =
    productions.filter(
      (item) =>
        item.completion_status ===
        "COMPLETED"
    ).length;

  const totalProductionCost =
    productions.reduce(
      (total, item) =>
        total +
        Number(
          item.production_cost || 0
        ),
      0
    );

  // ==================================================
  // LIVE STATUS
  // ==================================================

  const handleLiveStatus = async () => {
    try {
      setError("");

      const data =
        await getLiveProductionStatus();

      setLiveStatus(data);
      setShowLiveStatus(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load live production status."
      );
    }
  };

  // ==================================================
  // ANALYTICS
  // ==================================================

  const handleAnalytics = async () => {
    try {
      setError("");

      const data =
        await getProductionAnalytics();

      setAnalytics(data);
      setShowAnalytics(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load production analytics."
      );
    }
  };

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
              Manufacturing
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Vehicle Production
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage vehicle production from assembly to completion.
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={handleLiveStatus}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
            >
              Live Status
            </button>

            <button
              onClick={handleAnalytics}
              className="rounded-lg border border-blue-800 px-4 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-950"
            >
              Analytics
            </button>

            <button
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
            >
              + Add Production
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

        {/* SUMMARY */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total Vehicles"
            value={totalVehicles}
          />

          <SummaryCard
            title="In Progress"
            value={inProgressCount}
          />

          <SummaryCard
            title="Completed"
            value={completedCount}
          />

          <SummaryCard
            title="Production Cost"
            value={`₹${totalProductionCost.toLocaleString(
              "en-IN"
            )}`}
          />

        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 xl:grid-cols-4">

            {/* SEARCH */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Vehicle, chassis, stage..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            {/* LINE */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Production Line
              </label>

              <select
                value={lineFilter}
                onChange={(e) => {
                  setLineFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Production Lines
                </option>

                {productionLines.map(
                  (line) => (
                    <option
                      key={line.id}
                      value={line.id}
                    >
                      {line.line_name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STAGE */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Production Stage
              </label>

              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Stages
                </option>

                <option value="BODY">
                  Body
                </option>

                <option value="PAINT">
                  Paint
                </option>

                <option value="ENGINE">
                  Engine
                </option>

                <option value="ASSEMBLY">
                  Assembly
                </option>

                <option value="TESTING">
                  Testing
                </option>

                <option value="FINAL">
                  Final
                </option>

              </select>

            </div>

            {/* STATUS */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Completion Status
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

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

              </select>

            </div>

          </div>

          {(search ||
            lineFilter !== "All" ||
            stageFilter !== "All" ||
            statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setLineFilter("All");
                setStageFilter("All");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* PRODUCTION TABLE */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Vehicle Production List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage vehicle production records.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredProductions.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading production records...
            </div>

          ) : filteredProductions.length ===
            0 ? (

            <div className="p-10 text-center text-slate-400">
              No production records found.
            </div>

          ) : (

            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1200px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        ID
                      </th>

                      <th className="px-6 py-4">
                        Vehicle Model
                      </th>

                      <th className="px-6 py-4">
                        Production Line
                      </th>

                      <th className="px-6 py-4">
                        Chassis Number
                      </th>

                      <th className="px-6 py-4">
                        Production Stage
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Cost
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedProductions.map(
                      (production) => (

                        <tr
                          key={production.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4">
                            {production.id}
                          </td>

                          <td className="px-6 py-4 font-medium">
                            {production.vehicle_model}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {getLineName(
                              production.production_line_id
                            )}
                          </td>

                          <td className="px-6 py-4 font-mono text-xs">
                            {production.chassis_number}
                          </td>

                          <td className="px-6 py-4">
                            {production.production_stage}
                          </td>

                          <td className="px-6 py-4">

                            <StatusBadge
                              status={
                                production.completion_status
                              }
                            />

                          </td>

                          <td className="px-6 py-4">
                            ₹
                            {Number(
                              production.production_cost ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex flex-wrap gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    production.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    production
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    production
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

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  {editingProduction
                    ? "Edit Production"
                    : "Add Vehicle Production"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter vehicle production information.
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

              {/* VEHICLE MODEL */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Vehicle Model
                </label>

                <input
                  type="text"
                  name="vehicle_model"
                  value={
                    formData.vehicle_model
                  }
                  onChange={handleChange}
                  placeholder="Model X"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* PRODUCTION LINE */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Production Line
                </label>

                <select
                  name="production_line_id"
                  value={
                    formData.production_line_id
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Production Line
                  </option>

                  {productionLines.map(
                    (line) => (
                      <option
                        key={line.id}
                        value={line.id}
                      >
                        {line.line_name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CHASSIS */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">
                  Chassis Number
                </label>

                <input
                  type="text"
                  name="chassis_number"
                  value={
                    formData.chassis_number
                  }
                  onChange={handleChange}
                  placeholder="CHS-2026-0001"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* STAGE */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Production Stage
                </label>

                <select
                  name="production_stage"
                  value={
                    formData.production_stage
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Stage
                  </option>

                  <option value="BODY">
                    Body
                  </option>

                  <option value="PAINT">
                    Paint
                  </option>

                  <option value="ENGINE">
                    Engine
                  </option>

                  <option value="ASSEMBLY">
                    Assembly
                  </option>

                  <option value="TESTING">
                    Testing
                  </option>

                  <option value="FINAL">
                    Final
                  </option>

                </select>

              </div>

              {/* STATUS */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Completion Status
                </label>

                <select
                  name="completion_status"
                  value={
                    formData.completion_status
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                </select>

              </div>

              {/* COST */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Production Cost
                </label>

                <input
                  type="number"
                  name="production_cost"
                  value={
                    formData.production_cost
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="250000"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* BUTTONS */}
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
                    : editingProduction
                    ? "Update Production"
                    : "Create Production"}
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
        selectedProduction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Production Details
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {
                      selectedProduction.vehicle_model
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
                  label="Production ID"
                  value={
                    selectedProduction.id
                  }
                />

                <DetailRow
                  label="Vehicle Model"
                  value={
                    selectedProduction.vehicle_model
                  }
                />

                <DetailRow
                  label="Production Line"
                  value={getLineName(
                    selectedProduction.production_line_id
                  )}
                />

                <DetailRow
                  label="Chassis Number"
                  value={
                    selectedProduction.chassis_number
                  }
                />

                <DetailRow
                  label="Production Stage"
                  value={
                    selectedProduction.production_stage
                  }
                />

                <DetailRow
                  label="Completion Status"
                  value={
                    selectedProduction.completion_status
                  }
                />

                <DetailRow
                  label="Production Cost"
                  value={`₹${Number(
                    selectedProduction.production_cost ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}`}
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

      {/* ==================================================
          LIVE STATUS MODAL
      ================================================== */}

      {showLiveStatus && (
        <JsonModal
          title="Live Production Status"
          data={liveStatus}
          onClose={() =>
            setShowLiveStatus(false)
          }
        />
      )}

      {/* ==================================================
          ANALYTICS MODAL
      ================================================== */}

      {showAnalytics && (
        <JsonModal
          title="Production Analytics"
          data={analytics}
          onClose={() =>
            setShowAnalytics(false)
          }
        />
      )}

    </div>
  );
}

// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-blue-400">
        {value}
      </h3>

    </div>
  );
}

// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({ status }) {
  const styles = {
    COMPLETED:
      "bg-green-950 text-green-400",

    IN_PROGRESS:
      "bg-yellow-950 text-yellow-400",

    CANCELLED:
      "bg-red-950 text-red-400",
  };

  const labels = {
    COMPLETED: "Completed",
    IN_PROGRESS: "In Progress",
    CANCELLED: "Cancelled",
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

function JsonModal({ title, data, onClose }) {
  const isLiveStatus = title === "Live Production Status";

  const isAnalytics = title === "Production Analytics";

  if (!data) {
    return null;
  }

  // ==================================================
  // ANALYTICS VIEW
  // ==================================================

  if (isAnalytics) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

        <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Production
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Production Analytics
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Production performance and cost overview.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>

          </div>

          {/* CONTENT */}
          <div className="p-6">

            {/* KPI CARDS */}
            <div className="grid gap-4 md:grid-cols-3">

              <AnalyticsCard
                title="Total Production"
                value={data.total_production ?? 0}
                description="Total vehicles produced"
              />

              <AnalyticsCard
                title="In Progress"
                value={data.in_progress ?? 0}
                description="Currently being produced"
              />

              <AnalyticsCard
                title="Completed"
                value={data.completed ?? 0}
                description="Successfully completed"
              />

              <AnalyticsCard
                title="Total Production Cost"
                value={`₹${Number(
                  data.total_production_cost ?? 0
                ).toLocaleString("en-IN")}`}
                description="Total manufacturing cost"
              />

              <AnalyticsCard
                title="Average Production Cost"
                value={`₹${Number(
                  data.average_production_cost ?? 0
                ).toLocaleString("en-IN")}`}
                description="Average cost per vehicle"
              />

            </div>

            {/* PERFORMANCE SUMMARY */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

              <h3 className="text-base font-semibold text-white">
                Production Summary
              </h3>

              <div className="mt-4 space-y-4">

                <AnalyticsProgress
                  label="Production Progress"
                  value={
                    data.total_production > 0
                      ? Math.round(
                          (data.completed /
                            data.total_production) *
                            100
                        )
                      : 0
                  }
                />

                <AnalyticsProgress
                  label="Active Production"
                  value={
                    data.total_production > 0
                      ? Math.round(
                          (data.in_progress /
                            data.total_production) *
                            100
                        )
                      : 0
                  }
                />

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end border-t border-slate-800 px-6 py-4">

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // LIVE PRODUCTION STATUS
  // ==================================================

  if (isLiveStatus) {
    const activeProductions =
      data.active_productions || [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

        <div className="w-full max-w-6xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400"></span>

                <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
                  Live Monitoring
                </p>

              </div>

              <h2 className="mt-1 text-xl font-bold text-white">
                Live Production Status
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Real-time overview of active vehicle production.
              </p>

            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>

          </div>

          {/* CONTENT */}
          <div className="max-h-[75vh] overflow-y-auto p-6">

            {/* LIVE KPI */}
            <div className="grid gap-4 md:grid-cols-3">

              <AnalyticsCard
                title="Total Production"
                value={data.total_production ?? 0}
                description="Total production records"
              />

              <AnalyticsCard
                title="In Progress"
                value={data.in_progress ?? 0}
                description="Vehicles currently in production"
              />

              <AnalyticsCard
                title="Completed"
                value={data.completed ?? 0}
                description="Completed vehicles"
              />

            </div>

            {/* ACTIVE PRODUCTION */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950">

              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

                <div>

                  <h3 className="font-semibold text-white">
                    Active Production
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Vehicles currently being manufactured.
                  </p>

                </div>

                <span className="rounded-full bg-green-950 px-3 py-1 text-xs font-semibold text-green-400">
                  {activeProductions.length} Active
                </span>

              </div>

              {activeProductions.length === 0 ? (

                <div className="p-8 text-center text-sm text-slate-500">
                  No active production currently.
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px] text-left text-sm">

                    <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">

                      <tr>

                        <th className="px-5 py-4">
                          ID
                        </th>

                        <th className="px-5 py-4">
                          Vehicle
                        </th>

                        <th className="px-5 py-4">
                          Production Line
                        </th>

                        <th className="px-5 py-4">
                          Chassis Number
                        </th>

                        <th className="px-5 py-4">
                          Stage
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4">
                          Cost
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {activeProductions.map(
                        (production) => (

                          <tr
                            key={production.id}
                            className="border-b border-slate-800 last:border-0 hover:bg-slate-900"
                          >

                            <td className="px-5 py-4 font-medium">
                              #{production.id}
                            </td>

                            <td className="px-5 py-4">

                              <div className="font-semibold text-white">
                                {production.vehicle_model}
                              </div>

                            </td>

                            <td className="px-5 py-4 text-slate-400">
                              Line #
                              {
                                production.production_line_id
                              }
                            </td>

                            <td className="px-5 py-4 font-mono text-xs text-slate-300">
                              {
                                production.chassis_number
                              }
                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-md bg-blue-950 px-2.5 py-1 text-xs font-semibold text-blue-400">
                                {
                                  production.production_stage
                                }
                              </span>

                            </td>

                            <td className="px-5 py-4">

                              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-950 px-3 py-1 text-xs font-semibold text-yellow-400">

                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>

                                In Progress

                              </span>

                            </td>

                            <td className="px-5 py-4 font-semibold text-white">
                              ₹
                              {Number(
                                production.production_cost ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end border-t border-slate-800 px-6 py-4">

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>

          </div>

        </div>

      </div>
    );
  }

  return null;
}


// ==================================================
// ANALYTICS CARD
// ==================================================

function AnalyticsCard({
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-blue-400">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


// ==================================================
// ANALYTICS PROGRESS
// ==================================================

function AnalyticsProgress({
  label,
  value,
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm text-slate-300">
          {label}
        </span>

        <span className="text-sm font-semibold text-blue-400">
          {value}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${Math.min(
              100,
              Math.max(0, value)
            )}%`,
          }}
        />

      </div>

    </div>
  );
}

export default Production;