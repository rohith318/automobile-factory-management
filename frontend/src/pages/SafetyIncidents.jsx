import { useEffect, useMemo, useState } from "react";
import "../index.css";

import {
  getSafetyIncidents,
  createSafetyIncident,
  updateSafetyIncident,
  deleteSafetyIncident,
} from "../services/safetyIncidentService";

const emptyForm = {
  worker_id: "",
  incident_type: "",
  incident_date: "",
  severity: "LOW",
  remarks: "",
};

function SafetyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // =========================
  // Load Incidents
  // =========================

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSafetyIncidents();

      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load safety incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // =========================
  // Statistics
  // =========================

  const totalIncidents = incidents.length;

  const highSeverity = incidents.filter(
    (item) => item.severity?.toUpperCase() === "HIGH"
  ).length;

  const mediumSeverity = incidents.filter(
    (item) => item.severity?.toUpperCase() === "MEDIUM"
  ).length;

  const lowSeverity = incidents.filter(
    (item) => item.severity?.toUpperCase() === "LOW"
  ).length;

  // =========================
  // Search + Filter
  // =========================

  const filteredIncidents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        !searchText ||
        String(incident.worker_id)
          .toLowerCase()
          .includes(searchText) ||
        incident.incident_type
          ?.toLowerCase()
          .includes(searchText) ||
        incident.remarks
          ?.toLowerCase()
          .includes(searchText);

      const matchesSeverity =
        severityFilter === "ALL" ||
        incident.severity?.toUpperCase() === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [incidents, search, severityFilter]);

  // =========================
  // Pagination
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIncidents.length / itemsPerPage)
  );

  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // =========================
  // Form Change
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Open Add
  // =========================

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  // =========================
  // Open Edit
  // =========================

  const openEditForm = (incident) => {
    setEditingId(incident.id);

    setForm({
      worker_id: incident.worker_id ?? "",
      incident_type: incident.incident_type ?? "",
      incident_date: incident.incident_date ?? "",
      severity: incident.severity ?? "LOW",
      remarks: incident.remarks ?? "",
    });

    setError("");
    setShowForm(true);
  };

  // =========================
  // View
  // =========================

  const openView = (incident) => {
    setSelectedIncident(incident);
    setShowView(true);
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        worker_id: Number(form.worker_id),
        incident_type: form.incident_type,
        incident_date: form.incident_date,
        severity: form.severity,
        remarks: form.remarks || null,
      };

      if (editingId) {
        await updateSafetyIncident(editingId, payload);
      } else {
        await createSafetyIncident(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadIncidents();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Failed to save safety incident."
      );
    }
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this safety incident?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteSafetyIncident(id);

      await loadIncidents();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Failed to delete safety incident."
      );
    }
  };

  // =========================
  // Severity Badge
  // =========================

  const getSeverityClass = (severity) => {
    switch (severity?.toUpperCase()) {
      case "HIGH":
        return "badge badge-danger";

      case "MEDIUM":
        return "badge badge-warning";

      case "LOW":
        return "badge badge-success";

      default:
        return "badge";
    }
  };

  // =========================
  // Render
  // =========================

  return (
    <div className="page-container">

      {/* ================= HEADER ================= */}

      <div className="page-header">
        <div>
          <div className="page-section-label">
            SAFETY
          </div>

          <h1>Safety Incident Management</h1>

          <p>
            Monitor workplace incidents, safety risks and employee safety.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAddForm}
        >
          + Add Incident
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* ================= STATISTICS ================= */}

      <div className="stats-grid four">

        <div className="stat-card">
          <span>Total Incidents</span>
          <strong>{totalIncidents}</strong>
        </div>

        <div className="stat-card">
          <span>High Severity</span>
          <strong>{highSeverity}</strong>
        </div>

        <div className="stat-card">
          <span>Medium Severity</span>
          <strong>{mediumSeverity}</strong>
        </div>

        <div className="stat-card">
          <span>Low Severity</span>
          <strong>{lowSeverity}</strong>
        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="filter-card">

        <div className="filter-group search-group">
          <label>Search</label>

          <input
            type="text"
            placeholder="Worker ID, incident type or remarks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label>Severity</label>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Severity</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

      </div>

      {/* ================= LIST ================= */}

      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>Safety Incident List</h2>

            <p>
              View and manage workplace safety incidents.
            </p>
          </div>

          <span className="record-count">
            {filteredIncidents.length} records
          </span>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading safety incidents...
          </div>
        ) : paginatedIncidents.length === 0 ? (
          <div className="empty-state">
            No safety incidents found.
          </div>
        ) : (
          <>

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Worker ID</th>
                    <th>Incident Type</th>
                    <th>Date</th>
                    <th>Severity</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedIncidents.map((incident) => (

                    <tr key={incident.id}>

                      <td>
                        #{incident.id}
                      </td>

                      <td>
                        <strong>
                          EMP-{String(incident.worker_id).padStart(3, "0")}
                        </strong>
                      </td>

                      <td>
                        {incident.incident_type}
                      </td>

                      <td>
                        {incident.incident_date}
                      </td>

                      <td>
                        <span
                          className={getSeverityClass(
                            incident.severity
                          )}
                        >
                          {incident.severity}
                        </span>
                      </td>

                      <td className="remarks-cell">
                        {incident.remarks || "-"}
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="btn btn-view"
                            onClick={() => openView(incident)}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-edit"
                            onClick={() =>
                              openEditForm(incident)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-delete"
                            onClick={() =>
                              handleDelete(incident.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* ================= PAGINATION ================= */}

            <div className="pagination">

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <div>

                <button
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                >
                  Previous
                </button>

                <button
                  className="btn btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                >
                  Next
                </button>

              </div>

            </div>

          </>
        )}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Safety Incident"
                    : "Add Safety Incident"}
                </h2>

                <p>
                  Enter workplace safety incident details.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Worker ID *</label>

                  <input
                    type="number"
                    name="worker_id"
                    value={form.worker_id}
                    onChange={handleChange}
                    placeholder="Enter worker ID"
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Incident Type *</label>

                  <select
                    name="incident_type"
                    value={form.incident_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select incident type
                    </option>

                    <option value="WORKPLACE_INJURY">
                      Workplace Injury
                    </option>

                    <option value="MACHINE_ACCIDENT">
                      Machine Accident
                    </option>

                    <option value="FIRE">
                      Fire
                    </option>

                    <option value="CHEMICAL_EXPOSURE">
                      Chemical Exposure
                    </option>

                    <option value="ELECTRICAL">
                      Electrical Incident
                    </option>

                    <option value="SLIP_AND_FALL">
                      Slip and Fall
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Incident Date *</label>

                  <input
                    type="date"
                    name="incident_date"
                    value={form.incident_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Severity *</label>

                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    required
                  >
                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Remarks</label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Enter incident details or remarks..."
                    rows="4"
                  />
                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingId
                    ? "Update Incident"
                    : "Save Incident"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {showView && selectedIncident && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <div className="page-section-label">
                  SAFETY INCIDENT
                </div>

                <h2>Incident Details</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowView(false)}
              >
                ×
              </button>

            </div>

            <div className="details-grid">

              <div className="detail-item">
                <span>Incident ID</span>
                <strong>
                  #{selectedIncident.id}
                </strong>
              </div>

              <div className="detail-item">
                <span>Worker ID</span>
                <strong>
                  EMP-
                  {String(
                    selectedIncident.worker_id
                  ).padStart(3, "0")}
                </strong>
              </div>

              <div className="detail-item">
                <span>Incident Type</span>
                <strong>
                  {selectedIncident.incident_type}
                </strong>
              </div>

              <div className="detail-item">
                <span>Incident Date</span>
                <strong>
                  {selectedIncident.incident_date}
                </strong>
              </div>

              <div className="detail-item">
                <span>Severity</span>

                <strong>
                  <span
                    className={getSeverityClass(
                      selectedIncident.severity
                    )}
                  >
                    {selectedIncident.severity}
                  </span>
                </strong>
              </div>

              <div className="detail-item full-width">
                <span>Remarks</span>

                <strong>
                  {selectedIncident.remarks || "No remarks provided."}
                </strong>
              </div>

            </div>

            <div className="modal-footer">

              <button
                className="btn btn-secondary"
                onClick={() => setShowView(false)}
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

export default SafetyIncidents;