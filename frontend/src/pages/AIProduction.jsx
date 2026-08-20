import { useEffect, useState } from "react";
import api from "../services/api";

function AIProduction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrediction = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/ai/production-prediction"
      );

      setData(response.data);
    } catch (error) {
      console.error("AI prediction error:", error);

      setError(
        error?.response?.data?.detail ||
          "Unable to load production prediction."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrediction();
  }, []);

  const getStatusClass = (status) => {
    if (status === "EXCELLENT") {
      return "border-green-900 bg-green-950/30 text-green-400";
    }

    if (status === "GOOD") {
      return "border-blue-900 bg-blue-950/30 text-blue-400";
    }

    if (status === "MODERATE") {
      return "border-yellow-900 bg-yellow-950/30 text-yellow-400";
    }

    return "border-red-900 bg-red-950/30 text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-400">
          Loading AI production prediction...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
            AI / PREDICTION
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            AI Production Prediction
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Predict production performance using current
            factory production data.
          </p>
        </div>

        <button
          onClick={loadPrediction}
          className="rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold hover:bg-slate-800"
        >
          ↻ Refresh Prediction
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}

          <div className="mb-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Production Lines"
              value={data.total_production_lines}
              subtitle="Active production lines"
            />

            <StatCard
              title="Target Production"
              value={data.total_target}
              subtitle="Daily target"
            />

            <StatCard
              title="Current Output"
              value={data.total_current_output}
              subtitle="Current production"
            />

            <StatCard
              title="Predicted Output"
              value={data.total_predicted_output}
              subtitle="AI predicted output"
            />

          </div>

          {/* Overall Performance */}

          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                AI ANALYSIS
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Production Forecast
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Current production performance and predicted
                completion.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Overall Efficiency
                </p>

                <p className="mt-3 text-3xl font-bold text-blue-400">
                  {data.overall_efficiency}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Expected Completion
                </p>

                <p className="mt-3 text-3xl font-bold text-green-400">
                  {data.overall_completion}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Remaining Units
                </p>

                <p className="mt-3 text-3xl font-bold text-yellow-400">
                  {Math.max(
                    data.total_target -
                      data.total_predicted_output,
                    0
                  ).toFixed(2)}
                </p>
              </div>

            </div>

            {/* Progress */}

            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-400">
                  Predicted Production Progress
                </span>

                <span className="text-blue-400">
                  {data.overall_completion}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      data.overall_completion,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* Production Line Predictions */}

          <div className="rounded-xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-6 py-5">

              <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                PREDICTION RESULTS
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Production Line Analysis
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-slate-800 text-xs uppercase text-slate-400">

                  <tr>
                    <th className="px-6 py-4">
                      Production Line
                    </th>

                    <th className="px-6 py-4">
                      Target
                    </th>

                    <th className="px-6 py-4">
                      Current
                    </th>

                    <th className="px-6 py-4">
                      Predicted
                    </th>

                    <th className="px-6 py-4">
                      Efficiency
                    </th>

                    <th className="px-6 py-4">
                      Completion
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {data.predictions.map(
                    (prediction) => (
                      <tr
                        key={
                          prediction.production_line_id
                        }
                        className="border-b border-slate-800 last:border-0"
                      >

                        <td className="px-6 py-5 font-semibold">
                          {prediction.line_name}
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {prediction.target_per_day}
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {prediction.current_output}
                        </td>

                        <td className="px-6 py-5 font-semibold text-blue-400">
                          {prediction.predicted_output}
                        </td>

                        <td className="px-6 py-5">
                          {prediction.efficiency_percentage}%
                        </td>

                        <td className="px-6 py-5">
                          {prediction.expected_completion_percentage}%
                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                              prediction.prediction_status
                            )}`}
                          >
                            {prediction.prediction_status}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* Recommendation */}

          {data.predictions.length > 0 && (
            <div className="mt-6 rounded-xl border border-blue-900 bg-blue-950/20 p-6">

              <p className="text-sm font-semibold text-blue-400">
                🤖 AI Recommendation
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {
                  data.predictions[0]
                    .recommendation
                }
              </p>

            </div>
          )}

        </>
      )}

    </div>
  );
}


function StatCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-blue-400">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}


export default AIProduction;