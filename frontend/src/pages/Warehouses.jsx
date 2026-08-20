import { useEffect, useMemo, useState } from "react";

import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../services/warehouseService";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingWarehouse, setEditingWarehouse] =
    useState(null);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    warehouse_name: "",
    location: "",
    capacity: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================
  // LOAD WAREHOUSES
  // =========================

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWarehouses();

      setWarehouses(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load warehouses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
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
    setEditingWarehouse(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // =========================
  // EDIT
  // =========================

  const openEditForm = (warehouse) => {
    setEditingWarehouse(warehouse);

    setFormData({
      warehouse_name:
        warehouse.warehouse_name || "",
      location: warehouse.location || "",
      capacity:
        warehouse.capacity ?? "",
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
    setEditingWarehouse(null);
    setFormData(emptyForm);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.warehouse_name.trim() ||
      !formData.location.trim() ||
      formData.capacity === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(formData.capacity) < 0) {
      setError("Capacity cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        warehouse_name:
          formData.warehouse_name.trim(),

        location:
          formData.location.trim(),

        capacity:
          Number(formData.capacity),
      };

      if (editingWarehouse) {
        await updateWarehouse(
          editingWarehouse.id,
          data
        );

        showSuccess(
          "Warehouse updated successfully."
        );
      } else {
        await createWarehouse(data);

        showSuccess(
          "Warehouse added successfully."
        );
      }

      closeForm();

      await loadWarehouses();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Warehouse operation failed."
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
        await getWarehouseById(id);

      setSelectedWarehouse(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load warehouse details."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (warehouse) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${warehouse.warehouse_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteWarehouse(warehouse.id);

      showSuccess(
        "Warehouse deleted successfully."
      );

      await loadWarehouses();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete warehouse."
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredWarehouses = useMemo(() => {
    const value = search.toLowerCase();

    return warehouses.filter((warehouse) => {
      return (
        warehouse.warehouse_name
          ?.toLowerCase()
          .includes(value) ||
        warehouse.location
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [warehouses, search]);

  // =========================
  // TOTAL CAPACITY
  // =========================

  const totalCapacity = useMemo(() => {
    return warehouses.reduce(
      (total, warehouse) =>
        total + Number(warehouse.capacity || 0),
      0
    );
  }, [warehouses]);

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredWarehouses.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedWarehouses =
    filteredWarehouses.slice(
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
              STORAGE
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Warehouse Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage factory warehouses, locations and storage capacity.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Warehouse
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

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          <SummaryCard
            title="Total Warehouses"
            value={warehouses.length}
          />

          <SummaryCard
            title="Total Capacity"
            value={totalCapacity.toLocaleString()}
          />

          <SummaryCard
            title="Search Results"
            value={filteredWarehouses.length}
          />

        </div>

        {/* SEARCH */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <label className="mb-2 block text-sm text-slate-400">
            Search
          </label>

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search warehouse name or location..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

        </div>

        {/* WAREHOUSE LIST */}

        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Warehouse List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered warehouses.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredWarehouses.length} records
            </span>

          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading warehouses...
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No warehouses found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        ID
                      </th>

                      <th className="px-6 py-4">
                        Warehouse Name
                      </th>

                      <th className="px-6 py-4">
                        Location
                      </th>

                      <th className="px-6 py-4">
                        Capacity
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedWarehouses.map(
                      (warehouse) => (
                        <tr
                          key={warehouse.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 text-slate-400">
                            {warehouse.id}
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {warehouse.warehouse_name}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {warehouse.location}
                          </td>

                          <td className="px-6 py-4">
                            {Number(
                              warehouse.capacity
                            ).toLocaleString()}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    warehouse.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    warehouse
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    warehouse
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
                  STORAGE
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingWarehouse
                    ? "Edit Warehouse"
                    : "Add Warehouse"}
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

              <FormInput
                label="Warehouse Name"
                name="warehouse_name"
                value={
                  formData.warehouse_name
                }
                onChange={handleChange}
                placeholder="Main Raw Material Warehouse"
                required
              />

              <FormInput
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Sriperumbudur, Tamil Nadu"
                required
              />

              <FormInput
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="5000"
                required
              />

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
                    : editingWarehouse
                    ? "Update Warehouse"
                    : "Add Warehouse"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW MODAL */}

      {showDetails &&
        selectedWarehouse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    WAREHOUSE DETAILS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {
                      selectedWarehouse.warehouse_name
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
                  label="Warehouse ID"
                  value={
                    selectedWarehouse.id
                  }
                />

                <DetailRow
                  label="Warehouse Name"
                  value={
                    selectedWarehouse.warehouse_name
                  }
                />

                <DetailRow
                  label="Location"
                  value={
                    selectedWarehouse.location
                  }
                />

                <DetailRow
                  label="Capacity"
                  value={`${Number(
                    selectedWarehouse.capacity
                  ).toLocaleString()} units`}
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

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
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
        min={
          type === "number"
            ? "0"
            : undefined
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />

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

export default Warehouses;