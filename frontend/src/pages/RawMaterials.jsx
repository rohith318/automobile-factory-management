import { useEffect, useMemo, useState } from "react";

import {
  getRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../services/rawMaterialService";

import { getSuppliers } from "../services/supplierService";

function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingMaterial, setEditingMaterial] =
    useState(null);

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] =
    useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    material_code: "",
    material_name: "",
    stock_quantity: "",
    unit_price: "",
    supplier_id: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [materialData, supplierData] =
        await Promise.all([
          getRawMaterials(),
          getSuppliers(),
        ]);

      setMaterials(materialData);
      setSuppliers(supplierData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load raw materials."
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
    setEditingMaterial(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // ==================================================
  // EDIT
  // ==================================================

  const openEditForm = (material) => {
    setEditingMaterial(material);

    setFormData({
      material_code:
        material.material_code || "",

      material_name:
        material.material_name || "",

      stock_quantity:
        material.stock_quantity !== null &&
        material.stock_quantity !== undefined
          ? String(material.stock_quantity)
          : "",

      unit_price:
        material.unit_price !== null &&
        material.unit_price !== undefined
          ? String(material.unit_price)
          : "",

      supplier_id:
        material.supplier_id !== null &&
        material.supplier_id !== undefined
          ? String(material.supplier_id)
          : "",
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
    setEditingMaterial(null);
    setFormData(emptyForm);
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.material_code.trim() ||
      !formData.material_name.trim() ||
      !formData.supplier_id
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    const stockQuantity =
      Number(formData.stock_quantity) || 0;

    const unitPrice =
      Number(formData.unit_price) || 0;

    if (stockQuantity < 0) {
      setError(
        "Stock quantity cannot be negative."
      );
      return;
    }

    if (unitPrice < 0) {
      setError(
        "Unit price cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        material_code:
          formData.material_code.trim(),

        material_name:
          formData.material_name.trim(),

        stock_quantity: stockQuantity,

        unit_price: unitPrice,

        supplier_id: Number(
          formData.supplier_id
        ),
      };

      if (editingMaterial) {
        await updateRawMaterial(
          editingMaterial.id,
          data
        );

        showSuccessMessage(
          "Raw material updated successfully."
        );
      } else {
        await createRawMaterial(data);

        showSuccessMessage(
          "Raw material added successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Raw material operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // VIEW
  // ==================================================

  const handleView = async (id) => {
    try {
      setError("");

      const data =
        await getRawMaterialById(id);

      setSelectedMaterial(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load material details."
      );
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async (material) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${material.material_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteRawMaterial(material.id);

      showSuccessMessage(
        "Raw material deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete raw material."
      );
    }
  };

  // ==================================================
  // SUPPLIER NAME
  // ==================================================

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(
      (item) => item.id === supplierId
    );

    if (!supplier) {
      return `Supplier #${supplierId}`;
    }

    return (
      supplier.supplier_name ||
      supplier.name ||
      supplier.company_name ||
      `Supplier #${supplierId}`
    );
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const searchText =
        search.toLowerCase();

      const supplierName =
        getSupplierName(
          material.supplier_id
        ).toLowerCase();

      const matchesSearch =
        material.material_code
          ?.toLowerCase()
          .includes(searchText) ||
        material.material_name
          ?.toLowerCase()
          .includes(searchText) ||
        supplierName.includes(searchText);

      const matchesSupplier =
        supplierFilter === "All" ||
        String(material.supplier_id) ===
          String(supplierFilter);

      return (
        matchesSearch &&
        matchesSupplier
      );
    });
  }, [
    materials,
    suppliers,
    search,
    supplierFilter,
  ]);

  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMaterials.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedMaterials =
    filteredMaterials.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalMaterials = materials.length;

  const totalStock = materials.reduce(
    (sum, material) =>
      sum +
      Number(material.stock_quantity || 0),
    0
  );

  const totalInventoryValue =
    materials.reduce(
      (sum, material) =>
        sum +
        Number(
          material.stock_quantity || 0
        ) *
          Number(
            material.unit_price || 0
          ),
      0
    );

  const lowStockCount = materials.filter(
    (material) =>
      Number(material.stock_quantity || 0) <=
      10
  ).length;

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
              INVENTORY
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Raw Material Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage raw materials, stock quantities and supplier information.
            </p>

          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Raw Material
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
        <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Materials"
            value={totalMaterials}
          />

          <SummaryCard
            title="Total Stock"
            value={totalStock.toLocaleString("en-IN")}
          />

          <SummaryCard
            title="Inventory Value"
            value={`₹${totalInventoryValue.toLocaleString(
              "en-IN"
            )}`}
          />

          <SummaryCard
            title="Low Stock Items"
            value={lowStockCount}
          />

        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 lg:grid-cols-2">

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
                placeholder="Material code, name or supplier..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Supplier
              </label>

              <select
                value={supplierFilter}
                onChange={(e) => {
                  setSupplierFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Suppliers
                </option>

                {suppliers.map(
                  (supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {getSupplierName(
                        supplier.id
                      )}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {(search ||
            supplierFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setSupplierFilter("All");
                setCurrentPage(1);
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* LIST */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Raw Material List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered raw materials.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredMaterials.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading raw materials...
            </div>

          ) : filteredMaterials.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No raw materials found.
            </div>

          ) : (

            <>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        Material Code
                      </th>

                      <th className="px-6 py-4">
                        Material Name
                      </th>

                      <th className="px-6 py-4">
                        Supplier
                      </th>

                      <th className="px-6 py-4">
                        Stock Quantity
                      </th>

                      <th className="px-6 py-4">
                        Unit Price
                      </th>

                      <th className="px-6 py-4">
                        Stock Value
                      </th>

                      <th className="px-6 py-4">
                        Stock Status
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedMaterials.map(
                      (material) => {

                        const stock =
                          Number(
                            material.stock_quantity ||
                              0
                          );

                        const price =
                          Number(
                            material.unit_price ||
                              0
                          );

                        const stockValue =
                          stock * price;

                        return (
                          <tr
                            key={material.id}
                            className="border-b border-slate-800 hover:bg-slate-800/40"
                          >

                            <td className="px-6 py-4 font-mono text-xs font-semibold">
                              {
                                material.material_code
                              }
                            </td>

                            <td className="px-6 py-4 font-semibold">
                              {
                                material.material_name
                              }
                            </td>

                            <td className="px-6 py-4 text-slate-400">
                              {getSupplierName(
                                material.supplier_id
                              )}
                            </td>

                            <td className="px-6 py-4 font-semibold">
                              {stock.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-6 py-4">
                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-6 py-4 font-semibold">
                              ₹
                              {stockValue.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-6 py-4">

                              <StockBadge
                                quantity={stock}
                              />

                            </td>

                            <td className="px-6 py-4">

                              <div className="flex gap-2">

                                <button
                                  onClick={() =>
                                    handleView(
                                      material.id
                                    )
                                  }
                                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                                >
                                  View
                                </button>

                                <button
                                  onClick={() =>
                                    openEditForm(
                                      material
                                    )
                                  }
                                  className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      material
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
                  Page {safePage} of{" "}
                  {totalPages}
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

      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  INVENTORY
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingMaterial
                    ? "Edit Raw Material"
                    : "Add Raw Material"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter material and supplier information.
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

              {/* CODE */}
              <FormInput
                label="Material Code"
                name="material_code"
                value={
                  formData.material_code
                }
                onChange={handleChange}
                placeholder="RM-2026-001"
                required
              />

              {/* NAME */}
              <FormInput
                label="Material Name"
                name="material_name"
                value={
                  formData.material_name
                }
                onChange={handleChange}
                placeholder="Steel Sheet"
                required
              />

              {/* STOCK */}
              <FormInput
                label="Stock Quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={
                  formData.stock_quantity
                }
                onChange={handleChange}
                placeholder="0"
              />

              {/* UNIT PRICE */}
              <FormInput
                label="Unit Price"
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={
                  formData.unit_price
                }
                onChange={handleChange}
                placeholder="0"
              />

              {/* SUPPLIER */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">
                  Supplier
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <select
                  name="supplier_id"
                  value={
                    formData.supplier_id
                  }
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Supplier
                  </option>

                  {suppliers.map(
                    (supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {getSupplierName(
                          supplier.id
                        )}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PREVIEW */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 md:col-span-2">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Inventory Value
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-400">
                  ₹
                  {(
                    (Number(
                      formData.stock_quantity
                    ) || 0) *
                    (Number(
                      formData.unit_price
                    ) || 0)
                  ).toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Stock quantity × unit price
                </p>

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-2 md:col-span-2">

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
                    : editingMaterial
                    ? "Update Material"
                    : "Add Material"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==========================================
          VIEW DETAILS
      ========================================== */}

      {showDetails &&
        selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    MATERIAL DETAILS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {
                      selectedMaterial.material_name
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
                  label="Material ID"
                  value={
                    selectedMaterial.id
                  }
                />

                <DetailRow
                  label="Material Code"
                  value={
                    selectedMaterial.material_code
                  }
                />

                <DetailRow
                  label="Material Name"
                  value={
                    selectedMaterial.material_name
                  }
                />

                <DetailRow
                  label="Supplier"
                  value={getSupplierName(
                    selectedMaterial.supplier_id
                  )}
                />

                <DetailRow
                  label="Stock Quantity"
                  value={Number(
                    selectedMaterial.stock_quantity ||
                      0
                  ).toLocaleString("en-IN")}
                />

                <DetailRow
                  label="Unit Price"
                  value={`₹${Number(
                    selectedMaterial.unit_price ||
                      0
                  ).toLocaleString("en-IN")}`}
                />

                <DetailRow
                  label="Inventory Value"
                  value={`₹${(
                    Number(
                      selectedMaterial.stock_quantity ||
                        0
                    ) *
                    Number(
                      selectedMaterial.unit_price ||
                        0
                    )
                  ).toLocaleString(
                    "en-IN"
                  )}`}
                />

                <DetailRow
                  label="Stock Status"
                  value={
                    Number(
                      selectedMaterial.stock_quantity ||
                        0
                    ) <= 10
                      ? "Low Stock"
                      : "Available"
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

// ==================================================
// COMPONENTS
// ==================================================

function SummaryCard({
  title,
  value,
}) {
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
  min,
  step,
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
        min={min}
        step={step}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />

    </div>
  );
}

function StockBadge({ quantity }) {
  if (quantity <= 0) {
    return (
      <span className="rounded-full bg-red-950 px-3 py-1 text-xs font-semibold text-red-400">
        Out of Stock
      </span>
    );
  }

  if (quantity <= 10) {
    return (
      <span className="rounded-full bg-yellow-950 px-3 py-1 text-xs font-semibold text-yellow-400">
        Low Stock
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-950 px-3 py-1 text-xs font-semibold text-green-400">
      Available
    </span>
  );
}

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

export default RawMaterials;