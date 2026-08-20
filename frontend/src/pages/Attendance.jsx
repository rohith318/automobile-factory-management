import { useEffect, useMemo, useState } from "react";

import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceRecord,
  updateAttendance,
} from "../services/attendanceService";

import { getWorkers } from "../services/workerService";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingAttendance, setEditingAttendance] =
    useState(null);

  const [selectedAttendance, setSelectedAttendance] =
    useState(null);

  const [search, setSearch] = useState("");
  const [workerFilter, setWorkerFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    worker_id: "",
    attendance_date: "",
    check_in: "",
    check_out: "",
    overtime_hours: "0",
  };

  const [formData, setFormData] = useState(emptyForm);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [attendanceData, workerData] =
        await Promise.all([
          getAttendance(),
          getWorkers(),
        ]);

      setAttendance(attendanceData);
      setWorkers(workerData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // SUCCESS MESSAGE
  // --------------------------------------------------

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // ADD
  // --------------------------------------------------

  const openAddForm = () => {
    setEditingAttendance(null);

    setFormData({
      ...emptyForm,
      attendance_date: new Date()
        .toISOString()
        .slice(0, 10),
    });

    setError("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const openEditForm = (record) => {
    setEditingAttendance(record);

    setFormData({
      worker_id: record.worker_id
        ? String(record.worker_id)
        : "",

      attendance_date: record.attendance_date
        ? String(record.attendance_date).slice(0, 10)
        : "",

      check_in: record.check_in
        ? formatDateTimeLocal(record.check_in)
        : "",

      check_out: record.check_out
        ? formatDateTimeLocal(record.check_out)
        : "",

      overtime_hours:
        record.overtime_hours !== undefined &&
        record.overtime_hours !== null
          ? String(record.overtime_hours)
          : "0",
    });

    setError("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingAttendance(null);
    setFormData(emptyForm);
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.worker_id ||
      !formData.attendance_date
    ) {
      setError(
        "Worker and attendance date are required."
      );
      return;
    }

    if (formData.check_out && !formData.check_in) {
      setError(
        "Check-in time is required before check-out."
      );
      return;
    }

    if (
      formData.check_in &&
      formData.check_out &&
      new Date(formData.check_out) <
        new Date(formData.check_in)
    ) {
      setError(
        "Check-out time cannot be before check-in time."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        worker_id: Number(formData.worker_id),

        attendance_date:
          formData.attendance_date,

        check_in: formData.check_in
          ? formData.check_in
          : null,

        check_out: formData.check_out
          ? formData.check_out
          : null,

        overtime_hours: Number(
          formData.overtime_hours || 0
        ),
      };

      if (editingAttendance) {
        await updateAttendance(
          editingAttendance.id,
          data
        );

        showSuccessMessage(
          "Attendance updated successfully."
        );
      } else {
        await createAttendance(data);

        showSuccessMessage(
          "Attendance created successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Attendance operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // VIEW
  // --------------------------------------------------

  const handleView = async (attendanceId) => {
    try {
      setError("");

      const data = await getAttendanceRecord(
        attendanceId
      );

      setSelectedAttendance(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load attendance details."
      );
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `Delete attendance record for ${getWorkerName(
        record.worker_id
      )}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteAttendance(record.id);

      showSuccessMessage(
        "Attendance deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete attendance."
      );
    }
  };

  // --------------------------------------------------
  // WORKER NAME
  // --------------------------------------------------

  const getWorkerName = (workerId) => {
    const worker = workers.find(
      (item) => item.id === workerId
    );

    return worker
      ? worker.full_name
      : `Worker #${workerId}`;
  };

  const getEmployeeCode = (workerId) => {
    const worker = workers.find(
      (item) => item.id === workerId
    );

    return worker
      ? worker.employee_code
      : "-";
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const searchText = search.toLowerCase();

      const workerName = getWorkerName(
        record.worker_id
      ).toLowerCase();

      const employeeCode = getEmployeeCode(
        record.worker_id
      ).toLowerCase();

      const matchesSearch =
        workerName.includes(searchText) ||
        employeeCode.includes(searchText);

      const matchesWorker =
        workerFilter === "All" ||
        String(record.worker_id) ===
          String(workerFilter);

      const matchesDate =
        !dateFilter ||
        String(record.attendance_date).slice(
          0,
          10
        ) === dateFilter;

      return (
        matchesSearch &&
        matchesWorker &&
        matchesDate
      );
    });
  }, [
    attendance,
    workers,
    search,
    workerFilter,
    dateFilter,
  ]);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAttendance.length /
        itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedAttendance =
    filteredAttendance.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const totalRecords = attendance.length;

  const presentToday = attendance.filter(
    (record) =>
      String(record.attendance_date).slice(
        0,
        10
      ) ===
      new Date()
        .toISOString()
        .slice(0, 10)
  ).length;

  const totalOvertime = attendance.reduce(
    (total, record) =>
      total +
      Number(record.overtime_hours || 0),
    0
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Workforce
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Attendance Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track worker attendance, working hours and overtime.
            </p>

          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Attendance
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
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <SummaryCard
            title="Total Records"
            value={totalRecords}
          />

          <SummaryCard
            title="Today's Records"
            value={presentToday}
          />

          <SummaryCard
            title="Total Overtime Hours"
            value={`${totalOvertime} hrs`}
          />

        </div>

        {/* SEARCH / FILTER */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 lg:grid-cols-3">

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
                placeholder="Worker name or employee code..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Worker
              </label>

              <select
                value={workerFilter}
                onChange={(e) => {
                  setWorkerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Workers
                </option>

                {workers.map((worker) => (
                  <option
                    key={worker.id}
                    value={worker.id}
                  >
                    {worker.employee_code} -{" "}
                    {worker.full_name}
                  </option>
                ))}

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Attendance Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {(search || workerFilter !== "All" || dateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setWorkerFilter("All");
                setDateFilter("");
                setCurrentPage(1);
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Attendance List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage worker attendance records.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredAttendance.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading attendance...
            </div>

          ) : filteredAttendance.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No attendance records found.
            </div>

          ) : (

            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        Employee
                      </th>

                      <th className="px-6 py-4">
                        Worker
                      </th>

                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Check In
                      </th>

                      <th className="px-6 py-4">
                        Check Out
                      </th>

                      <th className="px-6 py-4">
                        Overtime
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

                    {paginatedAttendance.map(
                      (record) => (

                        <tr
                          key={record.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 font-medium">
                            {getEmployeeCode(
                              record.worker_id
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {getWorkerName(
                              record.worker_id
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {formatDate(
                              record.attendance_date
                            )}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {record.check_in
                              ? formatTime(
                                  record.check_in
                                )
                              : "-"}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {record.check_out
                              ? formatTime(
                                  record.check_out
                                )
                              : "-"}
                          </td>

                          <td className="px-6 py-4">
                            {Number(
                              record.overtime_hours || 0
                            )}{" "}
                            hrs
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                record.check_in
                                  ? "bg-green-950 text-green-400"
                                  : "bg-yellow-950 text-yellow-400"
                              }`}
                            >
                              {record.check_in
                                ? "Present"
                                : "Not Checked In"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex flex-wrap gap-2">

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

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  {editingAttendance
                    ? "Edit Attendance"
                    : "Add Attendance"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Record worker attendance and working hours.
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

              {/* WORKER */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">
                  Worker
                </label>

                <select
                  name="worker_id"
                  value={formData.worker_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Worker
                  </option>

                  {workers.map((worker) => (
                    <option
                      key={worker.id}
                      value={worker.id}
                    >
                      {worker.employee_code} -{" "}
                      {worker.full_name}
                    </option>
                  ))}

                </select>

              </div>

              {/* DATE */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Attendance Date
                </label>

                <input
                  type="date"
                  name="attendance_date"
                  value={formData.attendance_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* OVERTIME */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Overtime Hours
                </label>

                <input
                  type="number"
                  name="overtime_hours"
                  value={formData.overtime_hours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* CHECK IN */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Check In
                </label>

                <input
                  type="datetime-local"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* CHECK OUT */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Check Out
                </label>

                <input
                  type="datetime-local"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleChange}
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
                    : editingAttendance
                    ? "Update Attendance"
                    : "Create Attendance"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW DETAILS */}
      {showDetails && selectedAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Attendance Details
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {getWorkerName(
                    selectedAttendance.worker_id
                  )}
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
                label="Employee Code"
                value={getEmployeeCode(
                  selectedAttendance.worker_id
                )}
              />

              <DetailRow
                label="Worker"
                value={getWorkerName(
                  selectedAttendance.worker_id
                )}
              />

              <DetailRow
                label="Attendance Date"
                value={formatDate(
                  selectedAttendance.attendance_date
                )}
              />

              <DetailRow
                label="Check In"
                value={
                  selectedAttendance.check_in
                    ? formatDateTime(
                        selectedAttendance.check_in
                      )
                    : "-"
                }
              />

              <DetailRow
                label="Check Out"
                value={
                  selectedAttendance.check_out
                    ? formatDateTime(
                        selectedAttendance.check_out
                      )
                    : "-"
                }
              />

              <DetailRow
                label="Overtime"
                value={`${Number(
                  selectedAttendance.overtime_hours || 0
                )} hrs`}
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

// --------------------------------------------------
// SUMMARY CARD
// --------------------------------------------------

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

// --------------------------------------------------
// DETAIL ROW
// --------------------------------------------------

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-slate-800 pb-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value || "-"}
      </p>

    </div>
  );
}

// --------------------------------------------------
// DATE HELPERS
// --------------------------------------------------

function formatDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(
    `${String(dateValue).slice(0, 10)}T00:00:00`
  ).toLocaleDateString("en-IN");
}

function formatTime(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatDateTime(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function formatDateTimeLocal(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");
  const hours = String(
    date.getHours()
  ).padStart(2, "0");
  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default Attendance;