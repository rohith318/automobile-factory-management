import { useEffect, useMemo, useState } from "react";

import {
  createWorker,
  deleteWorker,
  getWorker,
  getWorkers,
  updateWorker,
} from "../services/workerService";

import { getDepartments } from "../services/departmentService";

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingWorker, setEditingWorker] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    employee_code: "",
    full_name: "",
    department_id: "",
    designation: "",
    phone: "",
    address: "",
    joining_date: "",
    salary: "",
    shift_type: "",
    status: "ACTIVE",
  };

  const [formData, setFormData] = useState(emptyForm);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [workerData, departmentData] = await Promise.all([
        getWorkers(),
        getDepartments(),
      ]);

      setWorkers(workerData);
      setDepartments(departmentData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load workers."
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
  // FORM INPUT
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
    setEditingWorker(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const openEditForm = (worker) => {
    setEditingWorker(worker);

    setFormData({
      employee_code: worker.employee_code || "",
      full_name: worker.full_name || "",
      department_id: worker.department_id
        ? String(worker.department_id)
        : "",
      designation: worker.designation || "",
      phone: worker.phone || "",
      address: worker.address || "",
      joining_date: worker.joining_date
        ? String(worker.joining_date).slice(0, 10)
        : "",
      salary:
        worker.salary !== undefined &&
        worker.salary !== null
          ? String(worker.salary)
          : "",
      shift_type: worker.shift_type || "",
      status: worker.status || "ACTIVE",
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
    setEditingWorker(null);
    setFormData(emptyForm);
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.employee_code.trim() ||
      !formData.full_name.trim() ||
      !formData.department_id ||
      !formData.designation.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.joining_date ||
      !formData.salary ||
      !formData.shift_type
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        employee_code: formData.employee_code.trim(),
        full_name: formData.full_name.trim(),
        department_id: Number(formData.department_id),
        designation: formData.designation.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        joining_date: formData.joining_date,
        salary: Number(formData.salary),
        shift_type: formData.shift_type,
        status: formData.status,
      };

      if (editingWorker) {
        await updateWorker(editingWorker.id, data);

        showSuccessMessage(
          "Worker updated successfully."
        );
      } else {
        await createWorker(data);

        showSuccessMessage(
          "Worker created successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Worker operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // VIEW
  // --------------------------------------------------

  const handleView = async (workerId) => {
    try {
      setError("");

      const data = await getWorker(workerId);

      setSelectedWorker(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load worker details."
      );
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (worker) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${worker.full_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteWorker(worker.id);

      showSuccessMessage(
        "Worker deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete worker."
      );
    }
  };

  // --------------------------------------------------
  // DEPARTMENT NAME
  // --------------------------------------------------

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (item) => item.id === departmentId
    );

    return department
      ? department.department_name
      : `Department #${departmentId}`;
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const searchText = search.toLowerCase();

      const departmentName = getDepartmentName(
        worker.department_id
      ).toLowerCase();

      const matchesSearch =
        worker.employee_code
          ?.toLowerCase()
          .includes(searchText) ||
        worker.full_name
          ?.toLowerCase()
          .includes(searchText) ||
        worker.designation
          ?.toLowerCase()
          .includes(searchText) ||
        departmentName.includes(searchText);

      const matchesDepartment =
        departmentFilter === "All" ||
        String(worker.department_id) ===
          String(departmentFilter);

      const matchesStatus =
        statusFilter === "All" ||
        worker.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    workers,
    departments,
    search,
    departmentFilter,
    statusFilter,
  ]);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredWorkers.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedWorkers = filteredWorkers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const activeWorkers = workers.filter(
    (worker) => worker.status === "ACTIVE"
  ).length;

  const inactiveWorkers = workers.filter(
    (worker) => worker.status !== "ACTIVE"
  ).length;

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
              Management
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Worker Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage employees and factory workers.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Worker
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
            title="Total Workers"
            value={workers.length}
          />

          <SummaryCard
            title="Active Workers"
            value={activeWorkers}
          />

          <SummaryCard
            title="Inactive Workers"
            value={inactiveWorkers}
          />

        </div>

        {/* SEARCH / FILTER */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 lg:grid-cols-4">

            {/* SEARCH */}
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
                placeholder="Employee code, name, designation..."
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
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Departments
                </option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.department_name}
                  </option>
                ))}

              </select>

            </div>

            {/* STATUS */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>
              <h2 className="text-lg font-semibold">
                Worker List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered workers.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {filteredWorkers.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading workers...
            </div>

          ) : filteredWorkers.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No workers found.
            </div>

          ) : (

            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        Employee Code
                      </th>

                      <th className="px-6 py-4">
                        Full Name
                      </th>

                      <th className="px-6 py-4">
                        Department
                      </th>

                      <th className="px-6 py-4">
                        Designation
                      </th>

                      <th className="px-6 py-4">
                        Phone
                      </th>

                      <th className="px-6 py-4">
                        Salary
                      </th>

                      <th className="px-6 py-4">
                        Shift
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

                    {paginatedWorkers.map(
                      (worker) => (

                        <tr
                          key={worker.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 font-medium">
                            {worker.employee_code}
                          </td>

                          <td className="px-6 py-4">
                            {worker.full_name}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {getDepartmentName(
                              worker.department_id
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {worker.designation}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {worker.phone}
                          </td>

                          <td className="px-6 py-4">
                            ₹
                            {Number(
                              worker.salary
                            ).toLocaleString("en-IN")}
                          </td>

                          <td className="px-6 py-4">
                            {worker.shift_type}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                worker.status ===
                                "ACTIVE"
                                  ? "bg-green-950 text-green-400"
                                  : "bg-red-950 text-red-400"
                              }`}
                            >
                              {worker.status}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex flex-wrap gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    worker.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    worker
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    worker
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

          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  {editingWorker
                    ? "Edit Worker"
                    : "Add Worker"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter worker information.
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

              {/* EMPLOYEE CODE */}
              <FormInput
                label="Employee Code"
                name="employee_code"
                value={formData.employee_code}
                onChange={handleChange}
                placeholder="EMP001"
              />

              {/* FULL NAME */}
              <FormInput
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
              />

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

              {/* DESIGNATION */}
              <FormInput
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Production Engineer"
              />

              {/* PHONE */}
              <FormInput
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                type="tel"
              />

              {/* JOINING DATE */}
              <FormInput
                label="Joining Date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                type="date"
              />

              {/* SALARY */}
              <FormInput
                label="Salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="35000"
                type="number"
              />

              {/* SHIFT */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Shift Type
                </label>

                <select
                  name="shift_type"
                  value={formData.shift_type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Shift
                  </option>

                  <option value="MORNING">
                    Morning
                  </option>

                  <option value="EVENING">
                    Evening
                  </option>

                  <option value="NIGHT">
                    Night
                  </option>

                  <option value="GENERAL">
                    General
                  </option>

                </select>

              </div>

              {/* STATUS */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>

                </select>

              </div>

              {/* ADDRESS */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter worker address"
                  required
                  rows="3"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 md:col-span-2">

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
                    : editingWorker
                    ? "Update Worker"
                    : "Create Worker"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW DETAILS */}
      {showDetails && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Worker Details
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedWorker.full_name}
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

            <div className="grid gap-4 md:grid-cols-2">

              <DetailRow
                label="Employee Code"
                value={
                  selectedWorker.employee_code
                }
              />

              <DetailRow
                label="Full Name"
                value={
                  selectedWorker.full_name
                }
              />

              <DetailRow
                label="Department"
                value={getDepartmentName(
                  selectedWorker.department_id
                )}
              />

              <DetailRow
                label="Designation"
                value={
                  selectedWorker.designation
                }
              />

              <DetailRow
                label="Phone"
                value={selectedWorker.phone}
              />

              <DetailRow
                label="Joining Date"
                value={
                  selectedWorker.joining_date
                }
              />

              <DetailRow
                label="Salary"
                value={`₹${Number(
                  selectedWorker.salary
                ).toLocaleString("en-IN")}`}
              />

              <DetailRow
                label="Shift"
                value={
                  selectedWorker.shift_type
                }
              />

              <DetailRow
                label="Status"
                value={selectedWorker.status}
              />

              <div className="md:col-span-2">

                <DetailRow
                  label="Address"
                  value={selectedWorker.address}
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

// --------------------------------------------------
// FORM INPUT
// --------------------------------------------------

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />

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

      <p className="mt-1 text-sm font-medium text-white">
        {value || "-"}
      </p>

    </div>
  );
}

export default Workers;