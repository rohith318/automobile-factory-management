import { useEffect, useMemo, useState } from "react";

import {
  getQualityChecks,
  getQualityCheckById,
  createQualityCheck,
  updateQualityCheck,
  deleteQualityCheck,
  getQualityReport,
} from "../services/qualityCheckService";

function QualityChecks() {
  const [checks, setChecks] = useState([]);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [editingCheck, setEditingCheck] =
    useState(null);

  const [selectedCheck, setSelectedCheck] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    production_id: "",
    checked_by: "",
    quality_status: "PASSED",
    remarks: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [qualityData, reportData] =
        await Promise.all([
          getQualityChecks(),
          getQualityReport(),
        ]);

      setChecks(qualityData);
      setReport(reportData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load quality control data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // SUCCESS MESSAGE
  // =========================

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingCheck(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (check) => {
    setEditingCheck(check);

    setFormData({
      production_id: check.production_id,
      checked_by: check.checked_by,
      quality_status: check.quality_status,
      remarks: check.remarks || "",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingCheck(null);
    setFormData(emptyForm);
  };

  // =========================
  // SAVE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.production_id ||
      !formData.checked_by ||
      !formData.quality_status
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        production_id: Number(
          formData.production_id
        ),
        checked_by:
          formData.checked_by.trim(),
        quality_status:
          formData.quality_status,
        remarks:
          formData.remarks.trim() || null,
      };

      if (editingCheck) {
        await updateQualityCheck(
          editingCheck.id,
          data
        );

        showSuccess(
          "Quality check updated successfully."
        );
      } else {
        await createQualityCheck(data);

        showSuccess(
          "Quality check added successfully."
        );
      }

      closeForm();
      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Quality check operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // VIEW
  // =========================

  const handleView = async (id) => {
    try {
      setError("");

      const data =
        await getQualityCheckById(id);

      setSelectedCheck(data);
      setShowView(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load quality check."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (check) => {
    const confirmed = window.confirm(
      `Delete quality check #${check.id}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteQualityCheck(check.id);

      showSuccess(
        "Quality check deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete quality check."
      );
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredChecks = useMemo(() => {
    const value = search.toLowerCase();

    return checks.filter((check) => {
      const checkedBy =
        check.checked_by?.toLowerCase() || "";

      const productionId =
        String(check.production_id);

      const remarks =
        check.remarks?.toLowerCase() || "";

      const matchesSearch =
        checkedBy.includes(value) ||
        productionId.includes(value) ||
        remarks.includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        check.quality_status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    checks,
    search,
    statusFilter,
  ]);

  // =========================
  // COUNTS
  // =========================

  const totalChecks = checks.length;

  const passedCount = checks.filter(
    (item) =>
      item.quality_status === "PASSED"
  ).length;

  const failedCount = checks.filter(
    (item) =>
      item.quality_status === "FAILED"
  ).length;

  const pendingCount = checks.filter(
    (item) =>
      item.quality_status === "PENDING"
  ).length;

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredChecks.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedChecks =
    filteredChecks.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case "PASSED":
        return "bg-green-950 text-green-400";

      case "FAILED":
        return "bg-red-950 text-red-400";

      case "PENDING":
        return "bg-yellow-950 text-yellow-400";

      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              QUALITY CONTROL
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Quality Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Monitor vehicle quality inspections and production standards.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={() =>
                setShowReport(true)
              }
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800"
            >
              Quality Report
            </button>

            <button
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
            >
              + Add Quality Check
            </button>

          </div>

        </div>

      </header>

      <main className="p-6 lg:p-8">

        {/* MESSAGES */}

        {success && (
          <div className="mb-5 rounded-lg border border-green-800 bg-green-950/40 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 flex justify-between rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
            >
              ✕
            </button>

          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6 grid gap-5 md:grid-cols-4">

          <SummaryCard
            title="Total Inspections"
            value={totalChecks}
          />

          <SummaryCard
            title="Passed"
            value={passedCount}
          />

          <SummaryCard
            title="Failed"
            value={failedCount}
          />

          <SummaryCard
            title="Pending"
            value={pendingCount}
          />

        </div>

        {/* FILTER */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-5 md:grid-cols-2">

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
                placeholder="Production ID, inspector or remarks..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Quality Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="PASSED">
                  Passed
                </option>

                <option value="FAILED">
                  Failed
                </option>

                <option value="PENDING">
                  Pending
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
                Quality Inspection List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage production quality inspections.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredChecks.length} records
            </span>

          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading quality checks...
            </div>
          ) : filteredChecks.length ===
            0 ? (
            <div className="p-10 text-center text-slate-400">
              No quality checks found.
            </div>
          ) : (
            <>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        ID
                      </th>

                      <th className="px-6 py-4">
                        Production
                      </th>

                      <th className="px-6 py-4">
                        Checked By
                      </th>

                      <th className="px-6 py-4">
                        Quality Status
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

                    {paginatedChecks.map(
                      (check) => (
                        <tr
                          key={check.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 font-medium">
                            #{check.id}
                          </td>

                          <td className="px-6 py-4 text-blue-400">
                            Production #
                            {
                              check.production_id
                            }
                          </td>

                          <td className="px-6 py-4">
                            {check.checked_by}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                check.quality_status
                              )}`}
                            >
                              {check.quality_status}
                            </span>

                          </td>

                          <td className="max-w-xs truncate px-6 py-4 text-slate-400">
                            {check.remarks ||
                              "-"}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    check.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    check
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    check
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
                  Page {safePage} of{" "}
                  {totalPages}
                </span>

                <div className="flex gap-2">

                  <button
                    disabled={
                      safePage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        safePage - 1
                      )
                    }
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40 hover:bg-slate-800"
                  >
                    Previous
                  </button>

                  <button
                    disabled={
                      safePage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        safePage + 1
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

      {/* =========================
          ADD / EDIT MODAL
          ========================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  QUALITY CONTROL
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingCheck
                    ? "Edit Quality Check"
                    : "Add Quality Check"}
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
              className="space-y-5"
            >

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Production ID
                  </label>

                  <input
                    type="number"
                    name="production_id"
                    value={
                      formData.production_id
                    }
                    onChange={handleChange}
                    min="1"
                    placeholder="Enter production ID"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Checked By
                  </label>

                  <input
                    type="text"
                    name="checked_by"
                    value={
                      formData.checked_by
                    }
                    onChange={handleChange}
                    placeholder="Inspector name"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Quality Status
                </label>

                <select
                  name="quality_status"
                  value={
                    formData.quality_status
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="PASSED">
                    PASSED
                  </option>

                  <option value="FAILED">
                    FAILED
                  </option>

                  <option value="PENDING">
                    PENDING
                  </option>

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Remarks
                </label>

                <textarea
                  name="remarks"
                  value={
                    formData.remarks
                  }
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter inspection remarks..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              <div className="flex justify-end gap-3 pt-3">

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
                    : editingCheck
                    ? "Update Quality Check"
                    : "Add Quality Check"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================
          VIEW MODAL
          ========================= */}

      {showView &&
        selectedCheck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    INSPECTION DETAILS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Quality Check #
                    {selectedCheck.id}
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowView(false)
                  }
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <DetailRow
                  label="Production ID"
                  value={`Production #${selectedCheck.production_id}`}
                />

                <DetailRow
                  label="Checked By"
                  value={
                    selectedCheck.checked_by
                  }
                />

                <DetailRow
                  label="Quality Status"
                  value={
                    selectedCheck.quality_status
                  }
                />

                <DetailRow
                  label="Remarks"
                  value={
                    selectedCheck.remarks
                  }
                />

              </div>

              <div className="mt-6 flex justify-end">

                <button
                  onClick={() =>
                    setShowView(false)
                  }
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800"
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =========================
          QUALITY REPORT
          ========================= */}

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  QUALITY CONTROL
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Quality Performance Report
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Production quality inspection overview.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowReport(false)
                }
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* REPORT CARDS */}

            <div className="grid gap-4 md:grid-cols-3">

              <ReportCard
                title="Total Inspections"
                value={totalChecks}
                subtitle="Quality inspections"
              />

              <ReportCard
                title="Passed"
                value={passedCount}
                subtitle="Successful inspections"
              />

              <ReportCard
                title="Failed"
                value={failedCount}
                subtitle="Failed inspections"
              />

            </div>

            {/* QUALITY RATE */}

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

              <div className="mb-3 flex justify-between">

                <span className="text-sm font-medium">
                  Quality Pass Rate
                </span>

                <span className="font-bold text-blue-400">
                  {totalChecks > 0
                    ? Math.round(
                        (passedCount /
                          totalChecks) *
                          100
                      )
                    : 0}
                  %
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${
                      totalChecks > 0
                        ? (passedCount /
                            totalChecks) *
                          100
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            {/* REPORT DATA */}

            {report &&
              typeof report ===
                "object" && (
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <h3 className="mb-4 font-semibold">
                    Quality Summary
                  </h3>

                  <div className="grid gap-3 md:grid-cols-2">

                    {Object.entries(
                      report
                    )
                      .filter(
                        ([key]) =>
                          ![
                            "checks",
                            "quality_checks",
                          ].includes(key)
                      )
                      .map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="rounded-lg border border-slate-800 bg-slate-900 p-4"
                          >

                            <p className="text-xs uppercase text-slate-500">
                              {key.replace(
                                /_/g,
                                " "
                              )}
                            </p>

                            <p className="mt-1 font-semibold text-blue-400">
                              {String(
                                value
                              )}
                            </p>

                          </div>
                        )
                      )}

                  </div>

                </div>
              )}

            <div className="mt-6 flex justify-end">

              <button
                onClick={() =>
                  setShowReport(false)
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

// =========================
// COMPONENTS
// =========================

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

function ReportCard({
  title,
  value,
  subtitle,
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
        {subtitle}
      </p>

    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-slate-800 pb-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white">
        {value || "-"}
      </p>

    </div>
  );
}

export default QualityChecks;