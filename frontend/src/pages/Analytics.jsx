import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import {
  getProductionAnalytics,
  getProductionLiveStatus,
  getCostAnalytics,
  getMaintenanceCostReport,
  getQualityReport,
} from "../services/analyticsService";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Analytics() {
  const [production, setProduction] = useState({});
  const [liveProduction, setLiveProduction] = useState({});
  const [cost, setCost] = useState({});
  const [maintenance, setMaintenance] = useState({});
  const [quality, setQuality] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getProductionAnalytics(),
        getProductionLiveStatus(),
        getCostAnalytics(),
        getMaintenanceCostReport(),
        getQualityReport(),
      ]);

      if (results[0].status === "fulfilled") {
        setProduction(results[0].value || {});
      }

      if (results[1].status === "fulfilled") {
        setLiveProduction(results[1].value || {});
      }

      if (results[2].status === "fulfilled") {
        setCost(results[2].value || {});
      }

      if (results[3].status === "fulfilled") {
        setMaintenance(results[3].value || {});
      }

      if (results[4].status === "fulfilled") {
        setQuality(results[4].value || {});
      }

      if (
        results.every(
          (result) => result.status === "rejected"
        )
      ) {
        setError("Unable to load analytics data.");
      }
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  // =========================
  // PRODUCTION DATA
  // =========================

  const totalProduction =
    production.total_production ??
    liveProduction.total_production ??
    0;

  const inProgress =
    production.in_progress ??
    liveProduction.in_progress ??
    0;

  const completed =
    production.completed ??
    0;

  const productionCost =
    production.total_production_cost ?? 0;

  const averageProductionCost =
    production.average_production_cost ?? 0;

  const completionPercentage =
    totalProduction > 0
      ? Math.round(
          (completed / totalProduction) * 100
        )
      : 0;

  // =========================
  // COST DATA
  // =========================

  const totalExpenses =
    cost.total_expenses ?? 0;

  const totalExpenseCost =
    cost.total_cost ?? 0;

  const averageExpense =
    cost.average_cost ?? 0;

  const maintenanceCost =
    maintenance.total_cost ??
    maintenance.total_maintenance_cost ??
    maintenance.total_costs ??
    0;

  const maintenanceRecords =
    maintenance.total_records ??
    maintenance.total_maintenance ??
    maintenance.count ??
    0;

  // =========================
  // QUALITY DATA
  // =========================

  const totalQuality =
    quality.total_inspections ??
    quality.total_checks ??
    quality.total_quality_checks ??
    0;

  const qualityPassed =
    quality.passed ??
    quality.passed_count ??
    0;

  const qualityFailed =
    quality.failed ??
    quality.failed_count ??
    0;

  const qualityPending =
    quality.pending ??
    quality.pending_count ??
    0;

  const activeProductions =
    liveProduction.active_productions || [];

  // =========================
  // CHART DATA
  // =========================

  const productionChartData = [
    {
      name: "Completed",
      value: completed,
    },
    {
      name: "In Progress",
      value: inProgress,
    },
  ];

  const costChartData = [
    {
      name: "Production",
      amount: productionCost,
    },
    {
      name: "Expenses",
      amount: totalExpenseCost,
    },
    {
      name: "Maintenance",
      amount: maintenanceCost,
    },
  ];

  const qualityChartData = [
    {
      name: "Passed",
      value: qualityPassed,
    },
    {
      name: "Failed",
      value: qualityFailed,
    },
    {
      name: "Pending",
      value: qualityPending,
    },
  ];

  // =====================================================
  // EXCEL EXPORT
  // =====================================================

  const exportToExcel = () => {
    const reportData = [
      {
        Category: "Production",
        Metric: "Total Production",
        Value: totalProduction,
      },
      {
        Category: "Production",
        Metric: "In Progress",
        Value: inProgress,
      },
      {
        Category: "Production",
        Metric: "Completed",
        Value: completed,
      },
      {
        Category: "Production",
        Metric: "Completion Rate",
        Value: `${completionPercentage}%`,
      },
      {
        Category: "Production",
        Metric: "Production Cost",
        Value: productionCost,
      },
      {
        Category: "Production",
        Metric: "Average Production Cost",
        Value: averageProductionCost,
      },

      {
        Category: "Expenses",
        Metric: "Total Expenses",
        Value: totalExpenses,
      },
      {
        Category: "Expenses",
        Metric: "Total Expense Cost",
        Value: totalExpenseCost,
      },
      {
        Category: "Expenses",
        Metric: "Average Expense",
        Value: averageExpense,
      },

      {
        Category: "Maintenance",
        Metric: "Maintenance Cost",
        Value: maintenanceCost,
      },
      {
        Category: "Maintenance",
        Metric: "Maintenance Records",
        Value: maintenanceRecords,
      },

      {
        Category: "Quality",
        Metric: "Total Inspections",
        Value: totalQuality,
      },
      {
        Category: "Quality",
        Metric: "Passed",
        Value: qualityPassed,
      },
      {
        Category: "Quality",
        Metric: "Failed",
        Value: qualityFailed,
      },
      {
        Category: "Quality",
        Metric: "Pending",
        Value: qualityPending,
      },
    ];

    const worksheet =
      XLSX.utils.json_to_sheet(reportData);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Factory Analytics"
    );

    XLSX.writeFile(
      workbook,
      "Factory_Analytics_Report.xlsx"
    );
  };

  // =====================================================
  // PDF EXPORT
  // =====================================================

  const exportToPDF = () => {
    const doc = new jsPDF();

    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.text(
      "Automobile Factory",
      20,
      y
    );

    y += 10;

    doc.setFontSize(16);
    doc.text(
      "Reports & Analytics",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      20,
      y
    );

    y += 15;

    // Line
    doc.line(20, y, 190, y);

    y += 12;

    // Production
    doc.setFontSize(14);
    doc.text(
      "Production Performance",
      20,
      y
    );

    y += 10;

    doc.setFontSize(11);

    doc.text(
      `Total Production: ${formatNumber(
        totalProduction
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `In Progress: ${formatNumber(
        inProgress
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Completed: ${formatNumber(
        completed
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Completion Rate: ${completionPercentage}%`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Production Cost: ${formatMoney(
        productionCost
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Average Production Cost: ${formatMoney(
        averageProductionCost
      )}`,
      25,
      y
    );

    y += 15;

    // Cost
    doc.setFontSize(14);
    doc.text(
      "Cost Analysis",
      20,
      y
    );

    y += 10;

    doc.setFontSize(11);

    doc.text(
      `Total Expenses: ${formatNumber(
        totalExpenses
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Total Expense Cost: ${formatMoney(
        totalExpenseCost
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Average Expense: ${formatMoney(
        averageExpense
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Maintenance Cost: ${formatMoney(
        maintenanceCost
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Maintenance Records: ${formatNumber(
        maintenanceRecords
      )}`,
      25,
      y
    );

    y += 15;

    // Quality
    doc.setFontSize(14);
    doc.text(
      "Quality Overview",
      20,
      y
    );

    y += 10;

    doc.setFontSize(11);

    doc.text(
      `Total Inspections: ${formatNumber(
        totalQuality
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Passed: ${formatNumber(
        qualityPassed
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Failed: ${formatNumber(
        qualityFailed
      )}`,
      25,
      y
    );

    y += 7;

    doc.text(
      `Pending: ${formatNumber(
        qualityPending
      )}`,
      25,
      y
    );

    y += 15;

    // Live Production
    doc.setFontSize(14);
    doc.text(
      "Live Production Status",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);

    if (activeProductions.length === 0) {
      doc.text(
        "No active production records.",
        25,
        y
      );
    } else {
      activeProductions.forEach(
        (item, index) => {
          doc.text(
            `${index + 1}. ${
              item.vehicle_model || "Vehicle"
            } | Stage: ${
              item.production_stage || "-"
            } | Status: ${
              item.completion_status || "-"
            } | Cost: ${formatMoney(
              item.production_cost
            )}`,
            25,
            y
          );

          y += 7;

          // Create new page if required
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
        }
      );
    }

    // Footer
    y = 285;

    doc.setFontSize(9);

    doc.text(
      "Automobile Industry Production & Factory Management System",
      20,
      y
    );

    doc.save(
      "Factory_Analytics_Report.pdf"
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div>
            <div className="analytics-label">
              REPORTS & ANALYTICS
            </div>

            <h1>Reports & Analytics</h1>

            <p>
              Monitor factory performance,
              production, operational costs and
              quality.
            </p>
          </div>
        </div>

        <div className="analytics-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">

        <div>
          <div className="analytics-label">
            REPORTS & ANALYTICS
          </div>

          <h1>Reports & Analytics</h1>

          <p>
            Monitor factory performance,
            production, operational costs and
            quality.
          </p>
        </div>

        <div className="analytics-header-actions">

          <button
            className="analytics-export-btn"
            onClick={exportToExcel}
          >
            ↓ Export Excel
          </button>

          <button
            className="analytics-pdf-btn"
            onClick={exportToPDF}
          >
            ↓ Export PDF
          </button>

          <button
            className="analytics-refresh-btn"
            onClick={loadAnalytics}
          >
            ↻ Refresh Reports
          </button>

        </div>

      </div>

      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="analytics-cards four">

        <div className="analytics-card">
          <span>Total Production</span>

          <strong>
            {formatNumber(totalProduction)}
          </strong>

          <small>
            Total vehicles produced
          </small>
        </div>

        <div className="analytics-card">
          <span>In Progress</span>

          <strong>
            {formatNumber(inProgress)}
          </strong>

          <small>
            Currently in production
          </small>
        </div>

        <div className="analytics-card">
          <span>Completed</span>

          <strong>
            {formatNumber(completed)}
          </strong>

          <small>
            Successfully completed
          </small>
        </div>

        <div className="analytics-card">
          <span>Production Cost</span>

          <strong>
            {formatMoney(productionCost)}
          </strong>

          <small>
            Total manufacturing cost
          </small>
        </div>

      </div>

      {/* PRODUCTION PERFORMANCE */}

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>

            <h2>
              Production Performance
            </h2>

            <p>
              Production output and completion
              overview.
            </p>

          </div>
        </div>

        <div className="analytics-cards three">

          <div className="analytics-report-card">

            <span>
              Average Production Cost
            </span>

            <strong>
              {formatMoney(
                averageProductionCost
              )}
            </strong>

          </div>

          <div className="analytics-report-card">

            <span>
              Active Production
            </span>

            <strong>
              {formatNumber(inProgress)}
            </strong>

          </div>

          <div className="analytics-report-card">

            <span>
              Completion Rate
            </span>

            <strong>
              {completionPercentage}%
            </strong>

          </div>

        </div>

        {/* PRODUCTION CHART */}

        <div className="analytics-chart-card">

          <div className="analytics-chart-title">
            Production Status
          </div>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={productionChartData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
              />

              <XAxis
                dataKey="name"
                stroke="#94a3b8"
              />

              <YAxis
                allowDecimals={false}
                stroke="#94a3b8"
              />

              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border:
                    "1px solid #1e293b",
                  borderRadius: "6px",
                  color: "#fff",
                }}
              />

              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[5, 5, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* PROGRESS */}

        <div className="analytics-progress">

          <div className="analytics-progress-header">

            <span>
              Production Completion
            </span>

            <strong>
              {completionPercentage}%
            </strong>

          </div>

          <div className="analytics-progress-track">

            <div
              className="analytics-progress-fill"
              style={{
                width: `${completionPercentage}%`,
              }}
            />

          </div>

        </div>

      </section>

      {/* COST ANALYSIS */}

      <section className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <h2>
              Cost Analysis
            </h2>

            <p>
              Factory expenses and maintenance
              cost overview.
            </p>

          </div>

        </div>

        <div className="analytics-cards three">

          <div className="analytics-report-card">

            <span>
              Total Factory Expenses
            </span>

            <strong>
              {formatMoney(
                totalExpenseCost
              )}
            </strong>

            <small>
              {formatNumber(totalExpenses)}
              {" "}expense records
            </small>

          </div>

          <div className="analytics-report-card">

            <span>
              Average Expense
            </span>

            <strong>
              {formatMoney(averageExpense)}
            </strong>

            <small>
              Average per expense
            </small>

          </div>

          <div className="analytics-report-card">

            <span>
              Maintenance Cost
            </span>

            <strong>
              {formatMoney(maintenanceCost)}
            </strong>

            <small>
              {formatNumber(
                maintenanceRecords
              )}
              {" "}maintenance records
            </small>

          </div>

        </div>

        {/* COST CHART */}

        <div className="analytics-chart-card">

          <div className="analytics-chart-title">
            Cost Comparison
          </div>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={costChartData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
              />

              <XAxis
                dataKey="name"
                stroke="#94a3b8"
              />

              <YAxis
                stroke="#94a3b8"
              />

              <Tooltip
                formatter={(value) =>
                  formatMoney(value)
                }
                contentStyle={{
                  background: "#0f172a",
                  border:
                    "1px solid #1e293b",
                  borderRadius: "6px",
                  color: "#fff",
                }}
              />

              <Bar
                dataKey="amount"
                fill="#8b5cf6"
                radius={[5, 5, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </section>

      {/* QUALITY OVERVIEW */}

      <section className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <h2>
              Quality Overview
            </h2>

            <p>
              Production quality inspection
              results.
            </p>

          </div>

        </div>

        <div className="analytics-cards four">

          <div className="analytics-quality-card">

            <span>
              Total Inspections
            </span>

            <strong>
              {formatNumber(totalQuality)}
            </strong>

          </div>

          <div className="analytics-quality-card success">

            <span>
              Passed
            </span>

            <strong>
              {formatNumber(
                qualityPassed
              )}
            </strong>

          </div>

          <div className="analytics-quality-card danger">

            <span>
              Failed
            </span>

            <strong>
              {formatNumber(
                qualityFailed
              )}
            </strong>

          </div>

          <div className="analytics-quality-card warning">

            <span>
              Pending
            </span>

            <strong>
              {formatNumber(
                qualityPending
              )}
            </strong>

          </div>

        </div>

        {/* QUALITY CHART */}

        <div className="analytics-chart-card">

          <div className="analytics-chart-title">
            Quality Inspection Results
          </div>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={qualityChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={105}
                label
              >

                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </section>

      {/* LIVE PRODUCTION */}

      <section className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <h2>
              Live Production Status
            </h2>

            <p>
              Current vehicle production
              activity.
            </p>

          </div>

          <span className="analytics-live">
            ● LIVE
          </span>

        </div>

        {activeProductions.length > 0 ? (

          <div className="analytics-table-wrapper">

            <table className="analytics-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>
                    Vehicle
                  </th>

                  <th>
                    Production Line
                  </th>

                  <th>
                    Chassis Number
                  </th>

                  <th>
                    Stage
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Cost
                  </th>

                </tr>

              </thead>

              <tbody>

                {activeProductions.map(
                  (item) => (

                    <tr key={item.id}>

                      <td>
                        #{item.id}
                      </td>

                      <td>
                        {item.vehicle_model}
                      </td>

                      <td>
                        Line #
                        {item.production_line_id}
                      </td>

                      <td>
                        {item.chassis_number}
                      </td>

                      <td>

                        <span className="analytics-stage">
                          {item.production_stage}
                        </span>

                      </td>

                      <td>

                        <span className="analytics-status">
                          {item.completion_status}
                        </span>

                      </td>

                      <td>
                        {formatMoney(
                          item.production_cost
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="analytics-empty">
            No active production records.
          </div>

        )}

      </section>

    </div>
  );
}

export default Analytics;