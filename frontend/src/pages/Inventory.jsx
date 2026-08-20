import { useEffect, useMemo, useState } from "react";

import {
  getInventoryTransactions,
  getInventoryTransactionById,
  createInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction,
} from "../services/inventoryTransactionService";

import { getRawMaterials } from "../services/rawMaterialService";

function Inventory() {
  const [transactions, setTransactions] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    material_id: "",
    transaction_type: "IN",
    quantity: "",
    transaction_date:
      new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionData, materialData] =
        await Promise.all([
          getInventoryTransactions(),
          getRawMaterials(),
        ]);

      setTransactions(transactionData);
      setMaterials(materialData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load inventory data."
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
  // MATERIAL NAME
  // =========================

  const getMaterialName = (materialId) => {
    const material = materials.find(
      (item) => item.id === materialId
    );

    return material
      ? material.material_name
      : `Material #${materialId}`;
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
    setEditingTransaction(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const openEditForm = (transaction) => {
    setEditingTransaction(transaction);

    setFormData({
      material_id: transaction.material_id,
      transaction_type:
        transaction.transaction_type,
      quantity: transaction.quantity,
      transaction_date:
        transaction.transaction_date,
    });

    setError("");
    setShowForm(true);
  };

  // =========================
  // CLOSE
  // =========================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingTransaction(null);
    setFormData(emptyForm);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.material_id ||
      !formData.transaction_type ||
      !formData.quantity ||
      !formData.transaction_date
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        material_id: Number(formData.material_id),
        transaction_type:
          formData.transaction_type,
        quantity: Number(formData.quantity),
        transaction_date:
          formData.transaction_date,
      };

      if (editingTransaction) {
        await updateInventoryTransaction(
          editingTransaction.id,
          data
        );

        showSuccess(
          "Inventory transaction updated successfully."
        );
      } else {
        await createInventoryTransaction(data);

        showSuccess(
          "Inventory transaction added successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Inventory operation failed."
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
        await getInventoryTransactionById(id);

      setSelectedTransaction(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load transaction."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (transaction) => {
    const confirmed = window.confirm(
      `Delete this ${transaction.transaction_type} transaction?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteInventoryTransaction(
        transaction.id
      );

      showSuccess(
        "Inventory transaction deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete transaction."
      );
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredTransactions = useMemo(() => {
    const value = search.toLowerCase();

    return transactions.filter((transaction) => {
      const materialName = getMaterialName(
        transaction.material_id
      ).toLowerCase();

      const matchesSearch =
        materialName.includes(value) ||
        String(transaction.material_id).includes(
          value
        );

      const matchesType =
        typeFilter === "ALL" ||
        transaction.transaction_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [
    transactions,
    materials,
    search,
    typeFilter,
  ]);

  // =========================
  // SUMMARY
  // =========================

  const totalTransactions = transactions.length;

  const totalIn = transactions
    .filter(
      (item) => item.transaction_type === "IN"
    )
    .reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

  const totalOut = transactions
    .filter(
      (item) => item.transaction_type === "OUT"
    )
    .reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTransactions.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedTransactions =
    filteredTransactions.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

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
              INVENTORY
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Inventory Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track raw material stock movement and inventory transactions.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Transaction
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
            >
              ✕
            </button>

          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6 grid gap-5 md:grid-cols-4">

          <SummaryCard
            title="Total Transactions"
            value={totalTransactions}
          />

          <SummaryCard
            title="Stock In"
            value={totalIn.toLocaleString()}
          />

          <SummaryCard
            title="Stock Out"
            value={totalOut.toLocaleString()}
          />

          <SummaryCard
            title="Materials"
            value={materials.length}
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
                placeholder="Material name or material ID..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Transaction Type
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
                  All Types
                </option>

                <option value="IN">
                  Stock In
                </option>

                <option value="OUT">
                  Stock Out
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
                Inventory Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage stock movements.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredTransactions.length} records
            </span>

          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading inventory...
            </div>
          ) : filteredTransactions.length ===
            0 ? (
            <div className="p-10 text-center text-slate-400">
              No inventory transactions found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        ID
                      </th>

                      <th className="px-6 py-4">
                        Material
                      </th>

                      <th className="px-6 py-4">
                        Transaction Type
                      </th>

                      <th className="px-6 py-4">
                        Quantity
                      </th>

                      <th className="px-6 py-4">
                        Date
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

                    {paginatedTransactions.map(
                      (transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 text-slate-400">
                            {transaction.id}
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {getMaterialName(
                              transaction.material_id
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                transaction.transaction_type ===
                                "IN"
                                  ? "bg-green-950 text-green-400"
                                  : "bg-red-950 text-red-400"
                              }`}
                            >
                              {transaction.transaction_type ===
                              "IN"
                                ? "Stock In"
                                : "Stock Out"}
                            </span>

                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {Number(
                              transaction.quantity
                            ).toLocaleString()}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {transaction.transaction_date}
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-400">
                              Recorded
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    transaction.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    transaction
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    transaction
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
                  INVENTORY
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingTransaction
                    ? "Edit Transaction"
                    : "Add Inventory Transaction"}
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

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Material
                </label>

                <select
                  name="material_id"
                  value={formData.material_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Material
                  </option>

                  {materials.map((material) => (
                    <option
                      key={material.id}
                      value={material.id}
                    >
                      {material.material_name}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Transaction Type
                </label>

                <select
                  name="transaction_type"
                  value={
                    formData.transaction_type
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="IN">
                    Stock In
                  </option>

                  <option value="OUT">
                    Stock Out
                  </option>

                </select>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="100"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Transaction Date
                  </label>

                  <input
                    type="date"
                    name="transaction_date"
                    value={
                      formData.transaction_date
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

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
                    : editingTransaction
                    ? "Update Transaction"
                    : "Add Transaction"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW MODAL */}

      {showDetails &&
        selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    TRANSACTION DETAILS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Inventory Transaction #
                    {
                      selectedTransaction.id
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
                  label="Transaction ID"
                  value={
                    selectedTransaction.id
                  }
                />

                <DetailRow
                  label="Material"
                  value={getMaterialName(
                    selectedTransaction.material_id
                  )}
                />

                <DetailRow
                  label="Transaction Type"
                  value={
                    selectedTransaction.transaction_type
                  }
                />

                <DetailRow
                  label="Quantity"
                  value={Number(
                    selectedTransaction.quantity
                  ).toLocaleString()}
                />

                <DetailRow
                  label="Transaction Date"
                  value={
                    selectedTransaction.transaction_date
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

export default Inventory;