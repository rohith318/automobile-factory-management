import { useEffect, useMemo, useState } from "react";

import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState(null);

  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    supplier_name: "",
    contact_person: "",
    phone: "",
    address: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // ================================
  // LOAD SUPPLIERS
  // ================================

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSuppliers();

      setSuppliers(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load suppliers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ================================
  // SUCCESS MESSAGE
  // ================================

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // ================================
  // FORM CHANGE
  // ================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================================
  // ADD
  // ================================

  const openAddForm = () => {
    setEditingSupplier(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // ================================
  // EDIT
  // ================================

  const openEditForm = (supplier) => {
    setEditingSupplier(supplier);

    setFormData({
      supplier_name: supplier.supplier_name || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

    setError("");
    setShowForm(true);
  };

  // ================================
  // CLOSE FORM
  // ================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingSupplier(null);
    setFormData(emptyForm);
  };

  // ================================
  // SUBMIT
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.supplier_name.trim() ||
      !formData.contact_person.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        supplier_name: formData.supplier_name.trim(),
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      if (editingSupplier) {
        await updateSupplier(
          editingSupplier.id,
          data
        );

        showSuccess(
          "Supplier updated successfully."
        );
      } else {
        await createSupplier(data);

        showSuccess(
          "Supplier added successfully."
        );
      }

      closeForm();

      await loadSuppliers();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Supplier operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // VIEW
  // ================================

  const handleView = async (id) => {
    try {
      setError("");

      const data = await getSupplierById(id);

      setSelectedSupplier(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load supplier details."
      );
    }
  };

  // ================================
  // DELETE
  // ================================

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${supplier.supplier_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteSupplier(supplier.id);

      showSuccess(
        "Supplier deleted successfully."
      );

      await loadSuppliers();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete supplier."
      );
    }
  };

  // ================================
  // SEARCH
  // ================================

  const filteredSuppliers = useMemo(() => {
    const value = search.toLowerCase();

    return suppliers.filter((supplier) => {
      return (
        supplier.supplier_name
          ?.toLowerCase()
          .includes(value) ||
        supplier.contact_person
          ?.toLowerCase()
          .includes(value) ||
        supplier.phone
          ?.toLowerCase()
          .includes(value) ||
        supplier.address
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [suppliers, search]);

  // ================================
  // PAGINATION
  // ================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSuppliers.length / itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedSuppliers =
    filteredSuppliers.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

  // ================================
  // UI
  // ================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              PROCUREMENT
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Supplier Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage suppliers and their contact information.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Supplier
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
            title="Total Suppliers"
            value={suppliers.length}
          />

          <SummaryCard
            title="Active Suppliers"
            value={suppliers.length}
          />

          <SummaryCard
            title="Search Results"
            value={filteredSuppliers.length}
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
            placeholder="Supplier name, contact person, phone or address..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Search
            </button>
          )}

        </div>

        {/* SUPPLIER LIST */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>
              <h2 className="text-lg font-semibold">
                Supplier List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered suppliers.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {filteredSuppliers.length} records
            </span>

          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading suppliers...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No suppliers found.
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
                        Supplier Name
                      </th>

                      <th className="px-6 py-4">
                        Contact Person
                      </th>

                      <th className="px-6 py-4">
                        Phone
                      </th>

                      <th className="px-6 py-4">
                        Address
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {paginatedSuppliers.map(
                      (supplier) => (
                        <tr
                          key={supplier.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 text-slate-400">
                            {supplier.id}
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {supplier.supplier_name}
                          </td>

                          <td className="px-6 py-4">
                            {supplier.contact_person}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {supplier.phone}
                          </td>

                          <td className="max-w-xs truncate px-6 py-4 text-slate-400">
                            {supplier.address}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    supplier.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    supplier
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    supplier
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
                  PROCUREMENT
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}
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
                label="Supplier Name"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                placeholder="Chennai Auto Components Pvt Ltd"
                required
              />

              <FormInput
                label="Contact Person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Rajesh Kumar"
                required
              />

              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Address
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Supplier address..."
                  rows="4"
                  required
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
                    : editingSupplier
                    ? "Update Supplier"
                    : "Add Supplier"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW MODAL */}
      {showDetails &&
        selectedSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    SUPPLIER DETAILS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {selectedSupplier.supplier_name}
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
                  label="Supplier ID"
                  value={selectedSupplier.id}
                />

                <DetailRow
                  label="Supplier Name"
                  value={
                    selectedSupplier.supplier_name
                  }
                />

                <DetailRow
                  label="Contact Person"
                  value={
                    selectedSupplier.contact_person
                  }
                />

                <DetailRow
                  label="Phone"
                  value={selectedSupplier.phone}
                />

                <div className="md:col-span-2">
                  <DetailRow
                    label="Address"
                    value={
                      selectedSupplier.address
                    }
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

// ======================================
// COMPONENTS
// ======================================

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

export default Suppliers;