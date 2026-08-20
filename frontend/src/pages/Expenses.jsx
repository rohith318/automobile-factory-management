import { useEffect, useMemo, useState } from "react";

import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getCostAnalytics,
} from "../services/expenseService";

function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [analytics, setAnalytics] = useState({
    total_expenses: 0,
    total_cost: 0,
    average_cost: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [editingExpense, setEditingExpense] =
    useState(null);

  const [selectedExpense, setSelectedExpense] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    expense_type: "",
    amount: "",
    expense_date:
      new Date().toISOString().split("T")[0],
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

      const [expenseData, analyticsData] =
        await Promise.all([
          getExpenses(),
          getCostAnalytics(),
        ]);

      setExpenses(expenseData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load expense data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // SUCCESS
  // =========================

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
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
  };

  // =========================
  // ADD
  // =========================

  const openAddForm = () => {
    setEditingExpense(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const openEditForm = (expense) => {
    setEditingExpense(expense);

    setFormData({
      expense_type: expense.expense_type,
      amount: expense.amount,
      expense_date: expense.expense_date,
      remarks: expense.remarks || "",
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
    setEditingExpense(null);
    setFormData(emptyForm);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.expense_type ||
      !formData.amount ||
      !formData.expense_date
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError(
        "Expense amount must be greater than zero."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        expense_type:
          formData.expense_type.trim(),

        amount: Number(formData.amount),

        expense_date:
          formData.expense_date,

        remarks:
          formData.remarks.trim() || null,
      };

      if (editingExpense) {
        await updateExpense(
          editingExpense.id,
          data
        );

        showSuccess(
          "Expense updated successfully."
        );
      } else {
        await createExpense(data);

        showSuccess(
          "Expense added successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Expense operation failed."
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
        await getExpenseById(id);

      setSelectedExpense(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load expense details."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      `Delete ${expense.expense_type} expense of ${formatCurrency(
        expense.amount
      )}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteExpense(expense.id);

      showSuccess(
        "Expense deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete expense."
      );
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredExpenses = useMemo(() => {
    const value = search.toLowerCase();

    return expenses.filter((expense) => {
      const type =
        expense.expense_type?.toLowerCase() || "";

      const remarks =
        expense.remarks?.toLowerCase() || "";

      const matchesSearch =
        type.includes(value) ||
        remarks.includes(value);

      const matchesType =
        typeFilter === "ALL" ||
        expense.expense_type === typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    });
  }, [
    expenses,
    search,
    typeFilter,
  ]);

  // =========================
  // EXPENSE TYPES
  // =========================

  const expenseTypes = [
    ...new Set(
      expenses
        .map((item) => item.expense_type)
        .filter(Boolean)
    ),
  ];

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredExpenses.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedExpenses =
    filteredExpenses.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

  // =========================
  // CURRENCY
  // =========================

  function formatCurrency(amount) {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  }

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
              Factory Expenses
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage factory expenses and monitor operational costs.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={() =>
                setShowAnalytics(true)
              }
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800"
            >
              Cost Report
            </button>

            <button
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
            >
              + Add Expense
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

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          <SummaryCard
            title="Total Expenses"
            value={
              analytics.total_expenses
            }
          />

          <SummaryCard
            title="Total Expense Cost"
            value={formatCurrency(
              analytics.total_cost
            )}
          />

          <SummaryCard
            title="Average Expense"
            value={formatCurrency(
              analytics.average_cost
            )}
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
                placeholder="Expense type or remarks..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Expense Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="ALL">
                  All Expense Types
                </option>

                {expenseTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

        </div>

        {/* EXPENSE LIST */}

        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Expense List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered factory expenses.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredExpenses.length} records
            </span>

          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading expenses...
            </div>
          ) : filteredExpenses.length ===
            0 ? (
            <div className="p-10 text-center text-slate-400">
              No expenses found.
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
                        Expense Type
                      </th>

                      <th className="px-6 py-4">
                        Amount
                      </th>

                      <th className="px-6 py-4">
                        Date
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

                    {paginatedExpenses.map(
                      (expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 text-slate-400">
                            {expense.id}
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-md bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-400">
                              {expense.expense_type}
                            </span>

                          </td>

                          <td className="px-6 py-4 font-bold text-blue-400">
                            {formatCurrency(
                              expense.amount
                            )}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {expense.expense_date}
                          </td>

                          <td className="max-w-xs truncate px-6 py-4 text-slate-400">
                            {expense.remarks ||
                              "-"}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    expense.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    expense
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    expense
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
                  EXPENSE
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingExpense
                    ? "Edit Expense"
                    : "Add Factory Expense"}
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

              {/* TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Expense Type
                </label>

                <input
                  type="text"
                  name="expense_type"
                  value={
                    formData.expense_type
                  }
                  onChange={handleChange}
                  placeholder="Maintenance, Electricity, Transport..."
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* AMOUNT + DATE */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Amount
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="25000"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Expense Date
                  </label>

                  <input
                    type="date"
                    name="expense_date"
                    value={
                      formData.expense_date
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* REMARKS */}

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
                  placeholder="Enter expense details..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

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
                    : editingExpense
                    ? "Update Expense"
                    : "Add Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================
          VIEW MODAL
          ========================= */}

      {showDetails &&
        selectedExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    EXPENSE DETAILS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Expense #
                    {selectedExpense.id}
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
                  label="Expense Type"
                  value={
                    selectedExpense.expense_type
                  }
                />

                <DetailRow
                  label="Amount"
                  value={formatCurrency(
                    selectedExpense.amount
                  )}
                />

                <DetailRow
                  label="Expense Date"
                  value={
                    selectedExpense.expense_date
                  }
                />

                <DetailRow
                  label="Remarks"
                  value={
                    selectedExpense.remarks
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

      {/* =========================
          COST REPORT MODAL
          ========================= */}

      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  FINANCIAL ANALYTICS
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Factory Cost Report
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Overview of factory operational expenses.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowAnalytics(false)
                }
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* ANALYTICS CARDS */}

            <div className="grid gap-4 md:grid-cols-3">

              <ReportCard
                title="Total Expenses"
                value={
                  analytics.total_expenses
                }
                subtitle="Recorded expenses"
              />

              <ReportCard
                title="Total Cost"
                value={formatCurrency(
                  analytics.total_cost
                )}
                subtitle="Total factory expense"
              />

              <ReportCard
                title="Average Cost"
                value={formatCurrency(
                  analytics.average_cost
                )}
                subtitle="Average per expense"
              />

            </div>

            {/* EXPENSE BREAKDOWN */}

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950">

              <div className="border-b border-slate-800 px-5 py-4">

                <h3 className="font-semibold">
                  Expense Breakdown
                </h3>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-5 py-3">
                        Type
                      </th>

                      <th className="px-5 py-3">
                        Amount
                      </th>

                      <th className="px-5 py-3">
                        Date
                      </th>

                      <th className="px-5 py-3">
                        Remarks
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {expenses.map(
                      (expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-slate-800"
                        >

                          <td className="px-5 py-3 font-medium">
                            {
                              expense.expense_type
                            }
                          </td>

                          <td className="px-5 py-3 font-semibold text-blue-400">
                            {formatCurrency(
                              expense.amount
                            )}
                          </td>

                          <td className="px-5 py-3 text-slate-400">
                            {
                              expense.expense_date
                            }
                          </td>

                          <td className="px-5 py-3 text-slate-400">
                            {
                              expense.remarks ||
                              "-"
                            }
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={() =>
                  setShowAnalytics(false)
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

export default Expenses;