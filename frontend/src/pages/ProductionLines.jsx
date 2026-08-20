import { useEffect, useMemo, useState } from "react";

import {
  createProductionLine,
  deleteProductionLine,
  getProductionLine,
  getProductionLines,
  updateProductionLine,
} from "../services/productionLineService";

import { getDepartments } from "../services/departmentService";

function ProductionLines() {
  const [productionLines, setProductionLines] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingLine, setEditingLine] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    line_name: "",
    department_id: "",
    target_per_day: "0",
    current_output: "0",
  };

  const [formData, setFormData] = useState(emptyForm);

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [lineData, departmentData] =
        await Promise.all([
          getProductionLines(),
          getDepartments(),
        ]);

      setProductionLines(lineData);
      setDepartments(departmentData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load production lines."
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
    setEditingLine(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // ==================================================
  // EDIT
  // ==================================================

  const openEditForm = (line) => {
    setEditingLine(line);

    setFormData({
      line_name: line.line_name || "",

      department_id: line.department_id
        ? String(line.department_id)
        : "",

      target_per_day:
        line.target_per_day !== undefined &&
        line.target_per_day !== null
          ? String(line.target_per_day)
          : "0",

      current_output:
        line.current_output !== undefined &&
        line.current_output !== null
          ? String(line.current_output)
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
    setEditingLine(null);
    setFormData(emptyForm);
  };

  // ==================================================
  // CREATE / UPDATE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.line_name.trim() ||
      !formData.department_id
    ) {
      setError(
        "Line name and department are required."
      );
      return;
    }

    const target = Number(
      formData.target_per_day || 0
    );

    const output = Number(
      formData.current_output || 0
    );

    if (target < 0 || output < 0) {
      setError(
        "Target and current output cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        line_name: formData.line_name.trim(),

        department_id: Number(
          formData.department_id
        ),

        target_per_day: target,

        current_output: output,
      };

      if (editingLine) {
        await updateProductionLine(
          editingLine.id,
          data
        );

        showSuccessMessage(
          "Production line updated successfully."
        );
      } else {
        await createProductionLine(data);

        showSuccessMessage(
          "Production line created successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Production line operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // VIEW
  // ==================================================

  const handleView = async (lineId) => {
    try {
      setError("");

      const data = await getProductionLine(lineId);

      setSelectedLine(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load production line details."
      );
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async (line) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${line.line_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProductionLine(line.id);

      showSuccessMessage(
        "Production line deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete production line."
      );
    }
  };

  // ==================================================
  // DEPARTMENT NAME
  // ==================================================

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (item) => item.id === departmentId
    );

    return department
      ? department.department_name
      : `Department #${departmentId}`;
  };

  // ==================================================
  // EFFICIENCY
  // ==================================================

  const getEfficiency = (line) => {
    const target = Number(
      line.target_per_day || 0
    );

    const output = Number(
      line.current_output || 0
    );

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      Math.round((output / target) * 100),
      100
    );
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredLines = useMemo(() => {
    return productionLines.filter((line) => {
      const searchText = search.toLowerCase();

      const departmentName =
        getDepartmentName(
          line.department_id
        ).toLowerCase();

      const matchesSearch =
        line.line_name
          ?.toLowerCase()
          .includes(searchText) ||
        departmentName.includes(searchText);

      const matchesDepartment =
        departmentFilter === "All" ||
        String(line.department_id) ===
          String(departmentFilter);

      return (
        matchesSearch &&
        matchesDepartment
      );
    });
  }, [
    productionLines,
    departments,
    search,
    departmentFilter,
  ]);

  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLines.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedLines = filteredLines.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalLines = productionLines.length;

  const totalTarget = productionLines.reduce(
    (total, line) =>
      total +
      Number(line.target_per_day || 0),
    0
  );

  const totalOutput = productionLines.reduce(
    (total, line) =>
      total +
      Number(line.current_output || 0),
    0
  );

  const overallEfficiency =
    totalTarget > 0
      ? Math.min(
          Math.round(
            (totalOutput / totalTarget) * 100
          ),
          100
        )
      : 0;

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Production
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Production Line Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage production lines and monitor daily output.
            </p>

          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Production Line
          </button>

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
            title="Production Lines"
            value={totalLines}
          />

          <SummaryCard
            title="Daily Target"
            value={totalTarget}
          />

          <SummaryCard
            title="Current Output"
            value={totalOutput}
          />

          <SummaryCard
            title="Overall Efficiency"
            value={`${overallEfficiency}%`}
          />

        </div>

        {/* SEARCH / FILTER */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 lg:grid-cols-3">

            <div className="lg:col-span-2">

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
                placeholder="Search production line or department..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

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
                      {department.department_name}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {(search ||
            departmentFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setDepartmentFilter("All");
                setCurrentPage(1);
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* PRODUCTION LIST */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Production Line List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered production lines.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredLines.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading production lines...
            </div>

          ) : filteredLines.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No production lines found.
            </div>

          ) : (

            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        ID
                      </th>

                      <th className="px-6 py-4">
                        Line Name
                      </th>

                      <th className="px-6 py-4">
                        Department
                      </th>

                      <th className="px-6 py-4">
                        Daily Target
                      </th>

                      <th className="px-6 py-4">
                        Current Output
                      </th>

                      <th className="px-6 py-4">
                        Efficiency
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedLines.map(
                      (line) => {

                        const efficiency =
                          getEfficiency(line);

                        return (
                          <tr
                            key={line.id}
                            className="border-b border-slate-800 hover:bg-slate-800/40"
                          >

                            <td className="px-6 py-4">
                              {line.id}
                            </td>

                            <td className="px-6 py-4 font-medium">
                              {line.line_name}
                            </td>

                            <td className="px-6 py-4 text-slate-400">
                              {getDepartmentName(
                                line.department_id
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {line.target_per_day}
                            </td>

                            <td className="px-6 py-4">
                              {line.current_output}
                            </td>

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">

                                  <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{
                                      width: `${efficiency}%`,
                                    }}
                                  />

                                </div>

                                <span className="text-xs">
                                  {efficiency}%
                                </span>

                              </div>

                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  efficiency >= 80
                                    ? "bg-green-950 text-green-400"
                                    : efficiency >=
                                      50
                                    ? "bg-yellow-950 text-yellow-400"
                                    : "bg-red-950 text-red-400"
                                }`}
                              >
                                {efficiency >= 80
                                  ? "On Target"
                                  : efficiency >=
                                    50
                                  ? "In Progress"
                                  : "Below Target"}
                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <div className="flex flex-wrap gap-2">

                                <button
                                  onClick={() =>
                                    handleView(
                                      line.id
                                    )
                                  }
                                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                                >
                                  View
                                </button>

                                <button
                                  onClick={() =>
                                    openEditForm(
                                      line
                                    )
                                  }
                                  className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      line
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

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  {editingLine
                    ? "Edit Production Line"
                    : "Add Production Line"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Configure production line details.
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

              {/* LINE NAME */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">
                  Line Name
                </label>

                <input
                  type="text"
                  name="line_name"
                  value={formData.line_name}
                  onChange={handleChange}
                  placeholder="Assembly Line 1"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* DEPARTMENT */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Department
                </label>

                <select
                  name="department_id"
                  value={formData.department_id}
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
                        {department.department_name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* TARGET */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Target Per Day
                </label>

                <input
                  type="number"
                  name="target_per_day"
                  value={
                    formData.target_per_day
                  }
                  onChange={handleChange}
                  min="0"
                  placeholder="100"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* CURRENT OUTPUT */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Current Output
                </label>

                <input
                  type="number"
                  name="current_output"
                  value={
                    formData.current_output
                  }
                  onChange={handleChange}
                  min="0"
                  placeholder="75"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* PREVIEW */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">

                <p className="text-xs text-slate-500">
                  Expected Efficiency
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-400">

                  {Number(
                    formData.target_per_day || 0
                  ) > 0
                    ? Math.min(
                        Math.round(
                          (Number(
                            formData.current_output ||
                              0
                          ) /
                            Number(
                              formData.target_per_day ||
                                1
                            )) *
                            100
                        ),
                        100
                      )
                    : 0}
                  %

                </p>

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
                    : editingLine
                    ? "Update Production Line"
                    : "Create Production Line"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==================================================
          VIEW DETAILS MODAL
      ================================================== */}

      {showDetails && selectedLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Production Line
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedLine.line_name}
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
                label="Line ID"
                value={selectedLine.id}
              />

              <DetailRow
                label="Line Name"
                value={
                  selectedLine.line_name
                }
              />

              <DetailRow
                label="Department"
                value={getDepartmentName(
                  selectedLine.department_id
                )}
              />

              <DetailRow
                label="Daily Target"
                value={
                  selectedLine.target_per_day
                }
              />

              <DetailRow
                label="Current Output"
                value={
                  selectedLine.current_output
                }
              />

              <DetailRow
                label="Efficiency"
                value={`${getEfficiency(
                  selectedLine
                )}%`}
              />

            </div>

            {/* PROGRESS */}
            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm">

                <span className="text-slate-400">
                  Production Progress
                </span>

                <span className="font-semibold">
                  {getEfficiency(
                    selectedLine
                  )}
                  %
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${getEfficiency(
                      selectedLine
                    )}%`,
                  }}
                />

              </div>

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
// DETAIL ROW
// ==================================================

function DetailRow({ label, value }) {
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

export default ProductionLines;