import { useEffect, useMemo, useState } from "react";

import {
  getRobotics,
  getRoboticsById,
  createRobotics,
  updateRobotics,
  deleteRobotics,
} from "../services/roboticsService";

import { getDepartments } from "../services/departmentService";

function Robotics() {
  const [robots, setRobots] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingRobot, setEditingRobot] =
    useState(null);

  const [selectedRobot, setSelectedRobot] =
    useState(null);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const emptyForm = {
    robot_code: "",
    robot_name: "",
    automation_type: "",
    department_id: "",
    maintenance_cycle_days: "30",
    current_status: "OPERATIONAL",
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

      const [robotData, departmentData] =
        await Promise.all([
          getRobotics(),
          getDepartments(),
        ]);

      setRobots(robotData);
      setDepartments(departmentData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load robotics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==================================================
  // SUCCESS
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
    setEditingRobot(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  // ==================================================
  // EDIT
  // ==================================================

  const openEditForm = (robot) => {
    setEditingRobot(robot);

    setFormData({
      robot_code: robot.robot_code || "",

      robot_name: robot.robot_name || "",

      automation_type:
        robot.automation_type || "",

      department_id:
        robot.department_id
          ? String(robot.department_id)
          : "",

      maintenance_cycle_days:
        robot.maintenance_cycle_days !==
          undefined &&
        robot.maintenance_cycle_days !== null
          ? String(
              robot.maintenance_cycle_days
            )
          : "30",

      current_status:
        robot.current_status ||
        "OPERATIONAL",
    });

    setError("");
    setShowForm(true);
  };

  // ==================================================
  // CLOSE
  // ==================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingRobot(null);
    setFormData(emptyForm);
  };

  // ==================================================
  // CREATE / UPDATE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.robot_code.trim() ||
      !formData.robot_name.trim() ||
      !formData.automation_type.trim() ||
      !formData.department_id
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    const maintenanceDays = Number(
      formData.maintenance_cycle_days
    );

    if (
      maintenanceDays <= 0 ||
      Number.isNaN(maintenanceDays)
    ) {
      setError(
        "Maintenance cycle must be greater than 0."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        robot_code:
          formData.robot_code.trim(),

        robot_name:
          formData.robot_name.trim(),

        automation_type:
          formData.automation_type.trim(),

        department_id: Number(
          formData.department_id
        ),

        maintenance_cycle_days:
          maintenanceDays,

        current_status:
          formData.current_status,
      };

      if (editingRobot) {
        await updateRobotics(
          editingRobot.id,
          data
        );

        showSuccessMessage(
          "Robot updated successfully."
        );
      } else {
        await createRobotics(data);

        showSuccessMessage(
          "Robot added successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Robotics operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // VIEW
  // ==================================================

  const handleView = async (robotId) => {
    try {
      setError("");

      const data =
        await getRoboticsById(robotId);

      setSelectedRobot(data);
      setShowDetails(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to load robot details."
      );
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async (robot) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${robot.robot_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteRobotics(robot.id);

      showSuccessMessage(
        "Robot deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Failed to delete robot."
      );
    }
  };

  // ==================================================
  // DEPARTMENT NAME
  // ==================================================

  const getDepartmentName = (
    departmentId
  ) => {
    const department =
      departments.find(
        (item) =>
          item.id === departmentId
      );

    return department
      ? department.department_name
      : `Department #${departmentId}`;
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredRobots = useMemo(() => {
    return robots.filter((robot) => {
      const searchText =
        search.toLowerCase();

      const departmentName =
        getDepartmentName(
          robot.department_id
        ).toLowerCase();

      const matchesSearch =
        robot.robot_code
          ?.toLowerCase()
          .includes(searchText) ||
        robot.robot_name
          ?.toLowerCase()
          .includes(searchText) ||
        robot.automation_type
          ?.toLowerCase()
          .includes(searchText) ||
        departmentName.includes(
          searchText
        );

      const matchesDepartment =
        departmentFilter === "All" ||
        String(
          robot.department_id
        ) === String(
          departmentFilter
        );

      const matchesStatus =
        statusFilter === "All" ||
        robot.current_status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    robots,
    departments,
    search,
    departmentFilter,
    statusFilter,
  ]);

  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRobots.length /
        itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const paginatedRobots =
    filteredRobots.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalRobots = robots.length;

  const operationalRobots =
    robots.filter(
      (robot) =>
        robot.current_status ===
        "OPERATIONAL"
    ).length;

  const maintenanceRobots =
    robots.filter(
      (robot) =>
        robot.current_status ===
        "MAINTENANCE"
    ).length;

  const inactiveRobots =
    robots.filter(
      (robot) =>
        robot.current_status ===
        "INACTIVE"
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
              AUTOMATION
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Robotics Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage industrial robots and automation systems.
            </p>

          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            + Add Robot
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
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total Robots"
            value={totalRobots}
          />

          <SummaryCard
            title="Operational"
            value={operationalRobots}
          />

          <SummaryCard
            title="Maintenance"
            value={maintenanceRobots}
          />

          <SummaryCard
            title="Inactive"
            value={inactiveRobots}
          />

        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="grid gap-4 xl:grid-cols-3">

            {/* SEARCH */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                placeholder="Robot code, name or automation type..."
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
                  setDepartmentFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Departments
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {
                        department.department_name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STATUS */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Robot Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Status
                </option>

                <option value="OPERATIONAL">
                  Operational
                </option>

                <option value="MAINTENANCE">
                  Maintenance
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

              </select>

            </div>

          </div>

          {(search ||
            departmentFilter !== "All" ||
            statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setDepartmentFilter("All");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* ROBOT LIST */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">
                Robotics List
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage registered industrial robots.
              </p>

            </div>

            <span className="text-sm text-slate-500">
              {filteredRobots.length} records
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              Loading robotics...
            </div>

          ) : filteredRobots.length === 0 ? (

            <div className="p-10 text-center text-slate-400">
              No robots found.
            </div>

          ) : (

            <>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>

                      <th className="px-6 py-4">
                        Robot Code
                      </th>

                      <th className="px-6 py-4">
                        Robot Name
                      </th>

                      <th className="px-6 py-4">
                        Automation Type
                      </th>

                      <th className="px-6 py-4">
                        Department
                      </th>

                      <th className="px-6 py-4">
                        Maintenance Cycle
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

                    {paginatedRobots.map(
                      (robot) => (

                        <tr
                          key={robot.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >

                          <td className="px-6 py-4 font-mono text-xs font-semibold">
                            {robot.robot_code}
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {robot.robot_name}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {
                              robot.automation_type
                            }
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {getDepartmentName(
                              robot.department_id
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-md bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-400">
                              {
                                robot.maintenance_cycle_days
                              }{" "}
                              days
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <StatusBadge
                              status={
                                robot.current_status
                              }
                            />

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleView(
                                    robot.id
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openEditForm(
                                    robot
                                  )
                                }
                                className="rounded-md border border-blue-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-950"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    robot
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

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Robotics
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingRobot
                    ? "Edit Robot"
                    : "Add Robot"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter industrial robot and automation details.
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

              {/* ROBOT CODE */}
              <FormInput
                label="Robot Code"
                name="robot_code"
                value={
                  formData.robot_code
                }
                onChange={handleChange}
                placeholder="ROB-2026-001"
                required
              />

              {/* ROBOT NAME */}
              <FormInput
                label="Robot Name"
                name="robot_name"
                value={
                  formData.robot_name
                }
                onChange={handleChange}
                placeholder="Assembly Robot A1"
                required
              />

              {/* AUTOMATION TYPE */}
              <FormInput
                label="Automation Type"
                name="automation_type"
                value={
                  formData.automation_type
                }
                onChange={handleChange}
                placeholder="Welding / Assembly / Painting"
                required
              />

              {/* DEPARTMENT */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Department
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <select
                  name="department_id"
                  value={
                    formData.department_id
                  }
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
                        {
                          department.department_name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* MAINTENANCE CYCLE */}
              <FormInput
                label="Maintenance Cycle (Days)"
                name="maintenance_cycle_days"
                type="number"
                min="1"
                value={
                  formData.maintenance_cycle_days
                }
                onChange={handleChange}
                placeholder="30"
                required
              />

              {/* STATUS */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Current Status
                </label>

                <select
                  name="current_status"
                  value={
                    formData.current_status
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="OPERATIONAL">
                    Operational
                  </option>

                  <option value="MAINTENANCE">
                    Maintenance
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>

                </select>

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
                    : editingRobot
                    ? "Update Robot"
                    : "Add Robot"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==================================================
          VIEW DETAILS
      ================================================== */}

      {showDetails &&
        selectedRobot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Robot Details
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {
                      selectedRobot.robot_name
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
                  label="Robot ID"
                  value={
                    selectedRobot.id
                  }
                />

                <DetailRow
                  label="Robot Code"
                  value={
                    selectedRobot.robot_code
                  }
                />

                <DetailRow
                  label="Robot Name"
                  value={
                    selectedRobot.robot_name
                  }
                />

                <DetailRow
                  label="Automation Type"
                  value={
                    selectedRobot.automation_type
                  }
                />

                <DetailRow
                  label="Department"
                  value={getDepartmentName(
                    selectedRobot.department_id
                  )}
                />

                <DetailRow
                  label="Maintenance Cycle"
                  value={`${selectedRobot.maintenance_cycle_days} days`}
                />

                <DetailRow
                  label="Current Status"
                  value={
                    selectedRobot.current_status
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
// SUMMARY CARD
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

// ==================================================
// FORM INPUT
// ==================================================

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
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
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />

    </div>
  );
}

// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({ status }) {
  const styles = {
    OPERATIONAL:
      "bg-green-950 text-green-400",

    MAINTENANCE:
      "bg-yellow-950 text-yellow-400",

    INACTIVE:
      "bg-slate-800 text-slate-400",
  };

  const labels = {
    OPERATIONAL: "Operational",
    MAINTENANCE: "Maintenance",
    INACTIVE: "Inactive",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-slate-800 text-slate-300"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// ==================================================
// DETAIL ROW
// ==================================================

function DetailRow({
  label,
  value,
}) {
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

export default Robotics;