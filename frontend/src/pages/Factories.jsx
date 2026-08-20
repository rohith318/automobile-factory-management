import { useEffect, useMemo, useState } from "react";
import {
  createFactory,
  deleteFactory,
  getFactories,
  getFactory,
  updateFactory,
} from "../services/factoryService";

function Factories() {
  const [factories, setFactories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingFactory, setEditingFactory] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [factoryName, setFactoryName] = useState("");
  const [location, setLocation] = useState("");

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // --------------------------------------------------
  // LOAD FACTORIES
  // --------------------------------------------------

  const loadFactories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getFactories();

      setFactories(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load factories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFactories();
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
  // OPEN ADD FORM
  // --------------------------------------------------

  const openAddForm = () => {
    setEditingFactory(null);
    setFactoryName("");
    setLocation("");
    setError("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // OPEN EDIT FORM
  // --------------------------------------------------

  const openEditForm = (factory) => {
    setEditingFactory(factory);

    setFactoryName(factory.factory_name || "");
    setLocation(factory.location || "");

    setError("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingFactory(null);
    setFactoryName("");
    setLocation("");
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!factoryName.trim() || !location.trim()) {
      setError("Factory name and location are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        factory_name: factoryName.trim(),
        location: location.trim(),
      };

      if (editingFactory) {
        await updateFactory(
          editingFactory.id,
          data
        );

        showSuccessMessage(
          "Factory updated successfully."
        );
      } else {
        await createFactory(data);

        showSuccessMessage(
          "Factory created successfully."
        );
      }

      closeForm();

      await loadFactories();

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

  // --------------------------------------------------
  // VIEW DETAILS
  // --------------------------------------------------

  const handleView = async (factoryId) => {
    try {
      setError("");

      const data = await getFactory(factoryId);

      setSelectedFactory(data);
      setShowDetails(true);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load factory details."
      );
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (factory) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${factory.factory_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteFactory(factory.id);

      showSuccessMessage(
        "Factory deleted successfully."
      );

      await loadFactories();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete factory."
      );
    }
  };

  // --------------------------------------------------
  // LOCATIONS
  // --------------------------------------------------

  const locations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(
        factories
          .map((factory) => factory.location)
          .filter(Boolean)
      ),
    ];

    return uniqueLocations;
  }, [factories]);

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredFactories = useMemo(() => {
    return factories.filter((factory) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        factory.factory_name
          ?.toLowerCase()
          .includes(searchText) ||
        factory.location
          ?.toLowerCase()
          .includes(searchText);

      const matchesLocation =
        locationFilter === "All" ||
        factory.location === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [factories, search, locationFilter]);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredFactories.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedFactories =
    filteredFactories.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleLocationFilter = (value) => {
    setLocationFilter(value);
    setCurrentPage(1);
  };

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
              Factory Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage automobile factories and their locations.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Factory
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
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-4 text-red-300 hover:text-white"
            >
              ✕
            </button>

          </div>
        )}

        {/* SUMMARY */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <SummaryCard
            title="Total Factories"
            value={factories.length}
          />

          <SummaryCard
            title="Total Departments"
            value={factories.reduce(
              (total, factory) =>
                total +
                Number(
                  factory.total_departments || 0
                ),
              0
            )}
          />

          <SummaryCard
            title="Active Factories"
            value={factories.length}
          />

        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 md:grid-cols-3">

            {/* SEARCH */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-slate-400">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearch(e.target.value)
                }
                placeholder="Search factory name or location..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

            </div>

            {/* LOCATION FILTER */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Location
              </label>

              <select
                value={locationFilter}
                onChange={(e) =>
                  handleLocationFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Locations
                </option>

                {locations.map((location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

        {/* FACTORY TABLE */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-5">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  Factory List
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  View and manage registered factories.
                </p>
              </div>

              <span className="text-sm text-slate-500">
                {filteredFactories.length} records
              </span>

            </div>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading factories...
            </div>

          ) : filteredFactories.length === 0 ? (

            <div className="p-10 text-center">

              <p className="text-slate-400">
                No factories found.
              </p>

              <button
                onClick={openAddForm}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold hover:bg-blue-700"
              >
                + Add Factory
              </button>

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
                        Factory Name
                      </th>

                      <th className="px-6 py-4">
                        Location
                      </th>

                      <th className="px-6 py-4">
                        Departments
                      </th>

                      <th className="px-6 py-4">
                        Created
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedFactories.map(
                      (factory) => (

                        <tr
                          key={factory.id}
                          className="border-b border-slate-800 transition hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4">
                            {factory.id}
                          </td>

                          <td className="px-6 py-4 font-medium text-white">
                            {factory.factory_name}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {factory.location}
                          </td>

                          <td className="px-6 py-4">
                            {factory.total_departments || 0}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {factory.created_at
                              ? new Date(
                                  factory.created_at
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex flex-wrap gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    factory.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    factory
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    factory
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

                <p className="text-sm text-slate-500">
                  Page {safeCurrentPage} of{" "}
                  {totalPages}
                </p>

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
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-800"
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
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-800"
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

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  {editingFactory
                    ? "Edit Factory"
                    : "Add New Factory"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter factory information.
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

              {/* FACTORY NAME */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Factory Name
                </label>

                <input
                  type="text"
                  value={factoryName}
                  onChange={(e) =>
                    setFactoryName(e.target.value)
                  }
                  placeholder="Enter factory name"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* LOCATION */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Enter factory location"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                    : editingFactory
                    ? "Update Factory"
                    : "Create Factory"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showDetails && selectedFactory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Factory Details
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedFactory.factory_name}
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
                label="Factory ID"
                value={selectedFactory.id}
              />

              <DetailRow
                label="Factory Name"
                value={
                  selectedFactory.factory_name
                }
              />

              <DetailRow
                label="Location"
                value={
                  selectedFactory.location
                }
              />

              <DetailRow
                label="Departments"
                value={
                  selectedFactory.total_departments ||
                  0
                }
              />

              <DetailRow
                label="Created"
                value={
                  selectedFactory.created_at
                    ? new Date(
                        selectedFactory.created_at
                      ).toLocaleString()
                    : "-"
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


/* ---------------------------------------
   SUMMARY CARD
--------------------------------------- */

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


/* ---------------------------------------
   DETAIL ROW
--------------------------------------- */

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="max-w-[60%] text-right text-sm font-medium text-white">
        {value}
      </span>

    </div>
  );
}

export default Factories;