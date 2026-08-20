import { useEffect, useMemo, useState } from "react";
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
} from "../services/departmentService";

import { getFactories } from "../services/factoryService";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [factories, setFactories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState(null);

  const [departmentName, setDepartmentName] = useState("");
  const [factoryId, setFactoryId] = useState("");

  const [search, setSearch] = useState("");
  const [factoryFilter, setFactoryFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // -----------------------------------------
  // LOAD DATA
  // -----------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [departmentData, factoryData] =
        await Promise.all([
          getDepartments(),
          getFactories(),
        ]);

      setDepartments(departmentData);
      setFactories(factoryData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -----------------------------------------
  // SUCCESS MESSAGE
  // -----------------------------------------

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // -----------------------------------------
  // ADD
  // -----------------------------------------

  const openAddForm = () => {
    setEditingDepartment(null);
    setDepartmentName("");
    setFactoryId("");
    setError("");
    setShowForm(true);
  };

  // -----------------------------------------
  // EDIT
  // -----------------------------------------

  const openEditForm = (department) => {
    setEditingDepartment(department);

    setDepartmentName(
      department.department_name || ""
    );

    setFactoryId(
      department.factory_id
        ? String(department.factory_id)
        : ""
    );

    setError("");
    setShowForm(true);
  };

  // -----------------------------------------
  // CLOSE FORM
  // -----------------------------------------

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingDepartment(null);
    setDepartmentName("");
    setFactoryId("");
  };

  // -----------------------------------------
  // CREATE / UPDATE
  // -----------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!factoryId) {
      setError("Please select a factory.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        department_name: departmentName.trim(),
        factory_id: Number(factoryId),
      };

      if (editingDepartment) {
        await updateDepartment(
          editingDepartment.id,
          data
        );

        showSuccessMessage(
          "Department updated successfully."
        );
      } else {
        await createDepartment(data);

        showSuccessMessage(
          "Department created successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Operation failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // VIEW
  // -----------------------------------------

  const handleView = async (departmentId) => {
    try {
      setError("");

      const data = await getDepartment(
        departmentId
      );

      setSelectedDepartment(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load department details."
      );
    }
  };

  // -----------------------------------------
  // DELETE
  // -----------------------------------------

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.department_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteDepartment(department.id);

      showSuccessMessage(
        "Department deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete department."
      );
    }
  };

  // -----------------------------------------
  // GET FACTORY NAME
  // -----------------------------------------

  const getFactoryName = (factoryId) => {
    const factory = factories.find(
      (item) => item.id === factoryId
    );

    return factory
      ? factory.factory_name
      : `Factory #${factoryId}`;
  };

  // -----------------------------------------
  // SEARCH + FILTER
  // -----------------------------------------

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchText = search.toLowerCase();

      const factoryName = getFactoryName(
        department.factory_id
      ).toLowerCase();

      const matchesSearch =
        department.department_name
          ?.toLowerCase()
          .includes(searchText) ||
        factoryName.includes(searchText);

      const matchesFactory =
        factoryFilter === "All" ||
        String(department.factory_id) ===
          String(factoryFilter);

      return matchesSearch && matchesFactory;
    });
  }, [
    departments,
    factories,
    search,
    factoryFilter,
  ]);

  // -----------------------------------------
  // PAGINATION
  // -----------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDepartments.length /
        itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedDepartments =
    filteredDepartments.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // -----------------------------------------
  // UI
  // -----------------------------------------

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
              Department Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage departments across your factories.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Department
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
            title="Total Departments"
            value={departments.length}
          />

          <SummaryCard
            title="Factories"
            value={factories.length}
          />

          <SummaryCard
            title="Departments Assigned"
            value={
              departments.filter(
                (item) => item.factory_id
              ).length
            }
          />

        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 md:grid-cols-3">

            <div className="md:col-span-2">

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
                placeholder="Search department or factory..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Factory
              </label>

              <select
                value={factoryFilter}
                onChange={(e) => {
                  setFactoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Factories
                </option>

                {factories.map((factory) => (
                  <option
                    key={factory.id}
                    value={factory.id}
                  >
                    {factory.factory_name}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Department List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered departments.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredDepartments.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading departments...
            </div>

          ) : filteredDepartments.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No departments found.
            </div>

          ) : (

            <>
              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        ID
                      </th>

                      <th className="px-6 py-4">
                        Department Name
                      </th>

                      <th className="px-6 py-4">
                        Factory
                      </th>

                      <th className="px-6 py-4">
                        Factory ID
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedDepartments.map(
                      (department) => (

                        <tr
                          key={department.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4">
                            {department.id}
                          </td>

                          <td className="px-6 py-4 font-medium">
                            {department.department_name}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {getFactoryName(
                              department.factory_id
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {department.factory_id}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex flex-wrap gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    department.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    department
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    department
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
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40"
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
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:opacity-40"
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

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter department information.
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
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Department Name
                </label>

                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) =>
                    setDepartmentName(
                      e.target.value
                    )
                  }
                  placeholder="Example: Assembly"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Factory
                </label>

                <select
                  value={factoryId}
                  onChange={(e) =>
                    setFactoryId(e.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Factory
                  </option>

                  {factories.map((factory) => (
                    <option
                      key={factory.id}
                      value={factory.id}
                    >
                      {factory.factory_name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm hover:bg-slate-800"
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
                    : editingDepartment
                    ? "Update Department"
                    : "Create Department"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs uppercase tracking-widest text-blue-400">
                  Department Details
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedDepartment.department_name}
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

            <div className="space-y-4">

              <DetailRow
                label="Department ID"
                value={selectedDepartment.id}
              />

              <DetailRow
                label="Department Name"
                value={
                  selectedDepartment.department_name
                }
              />

              <DetailRow
                label="Factory"
                value={getFactoryName(
                  selectedDepartment.factory_id
                )}
              />

              <DetailRow
                label="Factory ID"
                value={
                  selectedDepartment.factory_id
                }
              />

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm hover:bg-slate-800"
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium">
        {value}
      </span>

    </div>
  );
}

export default Departments;