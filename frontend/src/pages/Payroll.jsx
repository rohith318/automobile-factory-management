import { useEffect, useMemo, useState } from "react";

import {
  getPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  generatePayroll,
} from "../services/payrollService";

import { getWorkers } from "../services/workerService";

function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingPayroll, setEditingPayroll] =
    useState(null);

  const [selectedPayroll, setSelectedPayroll] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    worker_id: "",
    basic_salary: "",
    overtime_amount: 0,
    deductions: 0,
    final_salary: "",
    payment_status: "PENDING",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [payrollData, workerData] =
        await Promise.all([
          getPayroll(),
          getWorkers(),
        ]);

      setPayroll(payrollData);
      setWorkers(workerData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load payroll data."
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
  // WORKER NAME
  // =========================

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

    return worker?.employee_code || "-";
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Automatically calculate final salary
    if (
      name === "basic_salary" ||
      name === "overtime_amount" ||
      name === "deductions"
    ) {
      const basic =
        name === "basic_salary"
          ? Number(value)
          : Number(formData.basic_salary);

      const overtime =
        name === "overtime_amount"
          ? Number(value)
          : Number(formData.overtime_amount);

      const deductions =
        name === "deductions"
          ? Number(value)
          : Number(formData.deductions);

      const finalSalary =
        basic + overtime - deductions;

      setFormData((previous) => ({
        ...previous,
        [name]: value,
        final_salary:
          finalSalary >= 0 ? finalSalary : 0,
      }));
    }
  };

  // =========================
  // ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingPayroll(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // =========================
  // EDIT FORM
  // =========================

  const openEditForm = (item) => {
    setEditingPayroll(item);

    setFormData({
      worker_id: item.worker_id,
      basic_salary: item.basic_salary,
      overtime_amount: item.overtime_amount,
      deductions: item.deductions,
      final_salary: item.final_salary,
      payment_status: item.payment_status,
    });

    setError("");
    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingPayroll(null);
    setFormData(emptyForm);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.worker_id ||
      !formData.basic_salary ||
      formData.final_salary === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        worker_id: Number(formData.worker_id),
        basic_salary: Number(
          formData.basic_salary
        ),
        overtime_amount: Number(
          formData.overtime_amount || 0
        ),
        deductions: Number(
          formData.deductions || 0
        ),
        final_salary: Number(
          formData.final_salary
        ),
        payment_status:
          formData.payment_status,
      };

      if (editingPayroll) {
        await updatePayroll(
          editingPayroll.id,
          data
        );

        showSuccess(
          "Payroll updated successfully."
        );
      } else {
        await createPayroll(data);

        showSuccess(
          "Payroll created successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Payroll operation failed."
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

      const data = await getPayrollById(id);

      setSelectedPayroll(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load payroll details."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete payroll for ${getWorkerName(
        item.worker_id
      )}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deletePayroll(item.id);

      showSuccess(
        "Payroll deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete payroll."
      );
    }
  };

  // =========================
  // GENERATE PAYROLL
  // =========================

  const handleGenerate = async (workerId) => {
    const workerName =
      getWorkerName(workerId);

    const confirmed = window.confirm(
      `Generate payroll for ${workerName}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await generatePayroll(workerId);

      showSuccess(
        `Payroll generated successfully for ${workerName}.`
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to generate payroll."
      );
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredPayroll = useMemo(() => {
    const value = search.toLowerCase();

    return payroll.filter((item) => {
      const workerName = getWorkerName(
        item.worker_id
      ).toLowerCase();

      const employeeCode =
        getEmployeeCode(
          item.worker_id
        ).toLowerCase();

      const matchesSearch =
        workerName.includes(value) ||
        employeeCode.includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.payment_status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    payroll,
    workers,
    search,
    statusFilter,
  ]);

  // =========================
  // SUMMARY
  // =========================

  const totalPayroll = payroll.length;

  const totalSalary = payroll.reduce(
    (sum, item) =>
      sum + Number(item.final_salary || 0),
    0
  );

  const pendingPayments = payroll.filter(
    (item) =>
      item.payment_status === "PENDING"
  ).length;

  const paidPayments = payroll.filter(
    (item) =>
      item.payment_status === "PAID"
  ).length;

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPayroll.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedPayroll =
    filteredPayroll.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

  // =========================
  // CURRENCY
  // =========================

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;

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
              FINANCE
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Payroll Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage worker salaries, overtime and payroll payments.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
            >
              + Add Payroll
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
            >
              ✕
            </button>

          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6 grid gap-5 md:grid-cols-4">

          <SummaryCard
            title="Total Payroll Records"
            value={totalPayroll}
          />

          <SummaryCard
            title="Total Salary"
            value={formatCurrency(
              totalSalary
            )}
          />

          <SummaryCard
            title="Pending Payments"
            value={pendingPayments}
          />

          <SummaryCard
            title="Paid Payments"
            value={paidPayments}
          />

        </div>

        {/* FILTERS */}

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
                placeholder="Worker name or employee code..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Payment Status
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

                <option value="PENDING">
                  Pending
                </option>

                <option value="PAID">
                  Paid
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
                Payroll List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage worker payroll records.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredPayroll.length} records
            </span>

          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading payroll...
            </div>
          ) : filteredPayroll.length ===
            0 ? (
            <div className="p-10 text-center text-slate-400">
              No payroll records found.
            </div>
          ) : (
            <>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1200px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        Employee
                      </th>

                      <th className="px-6 py-4">
                        Worker
                      </th>

                      <th className="px-6 py-4">
                        Basic Salary
                      </th>

                      <th className="px-6 py-4">
                        Overtime
                      </th>

                      <th className="px-6 py-4">
                        Deductions
                      </th>

                      <th className="px-6 py-4">
                        Final Salary
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

                    {paginatedPayroll.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 font-semibold">
                            {getEmployeeCode(
                              item.worker_id
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {getWorkerName(
                              item.worker_id
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {formatCurrency(
                              item.basic_salary
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {formatCurrency(
                              item.overtime_amount
                            )}
                          </td>

                          <td className="px-6 py-4 text-red-400">
                            {formatCurrency(
                              item.deductions
                            )}
                          </td>

                          <td className="px-6 py-4 font-bold text-blue-400">
                            {formatCurrency(
                              item.final_salary
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.payment_status ===
                                "PAID"
                                  ? "bg-green-950 text-green-400"
                                  : "bg-yellow-950 text-yellow-400"
                              }`}
                            >
                              {item.payment_status}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    item.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    item
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleGenerate(
                                    item.worker_id
                                  )
                                }
                                className="rounded-md border border-green-800 px-3 py-1.5 text-xs text-green-400 hover:bg-green-950"
                              >
                                Generate
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    item
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
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40 hover:bg-slate-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  PAYROLL
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingPayroll
                    ? "Edit Payroll"
                    : "Add Payroll"}
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

              {/* WORKER */}

              <div>

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

              {/* SALARY */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Basic Salary
                  </label>

                  <input
                    type="number"
                    name="basic_salary"
                    value={
                      formData.basic_salary
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Overtime Amount
                  </label>

                  <input
                    type="number"
                    name="overtime_amount"
                    value={
                      formData.overtime_amount
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* DEDUCTION + FINAL */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Deductions
                  </label>

                  <input
                    type="number"
                    name="deductions"
                    value={
                      formData.deductions
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Final Salary
                  </label>

                  <input
                    type="number"
                    name="final_salary"
                    value={
                      formData.final_salary
                    }
                    readOnly
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-blue-400 outline-none"
                  />

                </div>

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Payment Status
                </label>

                <select
                  name="payment_status"
                  value={
                    formData.payment_status
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="PAID">
                    Paid
                  </option>

                </select>

              </div>

              {/* BUTTONS */}

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
                    : editingPayroll
                    ? "Update Payroll"
                    : "Create Payroll"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW MODAL */}

      {showDetails &&
        selectedPayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    PAYROLL DETAILS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Payroll #
                    {selectedPayroll.id}
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
                  label="Employee"
                  value={getEmployeeCode(
                    selectedPayroll.worker_id
                  )}
                />

                <DetailRow
                  label="Worker"
                  value={getWorkerName(
                    selectedPayroll.worker_id
                  )}
                />

                <DetailRow
                  label="Basic Salary"
                  value={formatCurrency(
                    selectedPayroll.basic_salary
                  )}
                />

                <DetailRow
                  label="Overtime"
                  value={formatCurrency(
                    selectedPayroll.overtime_amount
                  )}
                />

                <DetailRow
                  label="Deductions"
                  value={formatCurrency(
                    selectedPayroll.deductions
                  )}
                />

                <DetailRow
                  label="Final Salary"
                  value={formatCurrency(
                    selectedPayroll.final_salary
                  )}
                />

                <DetailRow
                  label="Payment Status"
                  value={
                    selectedPayroll.payment_status
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

export default Payroll;