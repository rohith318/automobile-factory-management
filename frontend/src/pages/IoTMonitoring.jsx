import { useEffect, useState } from "react";
import api from "../services/api";

function IoTMonitoring() {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] =
    useState(1);
  const [iotData, setIotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load machinery list
  const loadMachines = async () => {
    try {
      const response = await api.get("/machinery/");
      setMachines(response.data);

      if (response.data.length > 0) {
        setSelectedMachine(response.data[0].id);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load machines.");
    }
  };

  // Load IoT sensor data
  const loadIoTData = async () => {
    if (!selectedMachine) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/iot/machine/${selectedMachine}`
      );

      setIotData(response.data);
    } catch (error) {
      console.error(error);
      setError(
        error?.response?.data?.detail ||
          "Unable to load IoT data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    if (!selectedMachine) return;

    loadIoTData();

    // Simulate live IoT updates
    const interval = setInterval(() => {
      loadIoTData();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedMachine]);

  const getRiskClass = (risk) => {
    if (risk === "HIGH") {
      return "border-red-900 bg-red-950/30 text-red-400";
    }

    if (risk === "MEDIUM") {
      return "border-yellow-900 bg-yellow-950/30 text-yellow-400";
    }

    return "border-green-900 bg-green-950/30 text-green-400";
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            IoT / FACTORY MONITORING
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            IoT Machine Monitoring
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Monitor live machine sensor data and
            operating conditions.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <span className="flex items-center gap-2 rounded-full border border-green-900 bg-green-950/30 px-4 py-2 text-xs font-semibold text-green-400">

            <span className="h-2 w-2 rounded-full bg-green-400" />

            LIVE

          </span>

          <button
            onClick={loadIoTData}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            ↻ Refresh
          </button>

        </div>

      </div>


      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 px-5 py-4 text-sm text-red-400">
          {error}
        </div>
      )}


      {/* Machine Selection */}

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Select Machine
        </label>

        <select
          value={selectedMachine}
          onChange={(e) =>
            setSelectedMachine(
              Number(e.target.value)
            )
          }
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500 md:max-w-xl"
        >

          {machines.map((machine) => (
            <option
              key={machine.id}
              value={machine.id}
            >
              {machine.machine_name} -{" "}
              {machine.machine_code}
            </option>
          ))}

        </select>

      </div>


      {/* Sensor Dashboard */}

      <div className="rounded-xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 px-6 py-5">

          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            LIVE SENSOR DATA
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Machine Sensor Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Sensor values automatically refresh every
            5 seconds.
          </p>

        </div>


        {loading && !iotData ? (

          <div className="p-12 text-center text-slate-400">
            Loading IoT sensor data...
          </div>

        ) : iotData ? (

          <div className="p-6">

            {/* Sensor Cards */}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <SensorCard
                title="Temperature"
                value={iotData.temperature}
                unit="°C"
                icon="🌡️"
              />

              <SensorCard
                title="Vibration"
                value={iotData.vibration}
                unit=""
                icon="〰️"
              />

              <SensorCard
                title="RPM"
                value={Math.round(
                  iotData.rpm
                ).toLocaleString("en-IN")}
                unit="RPM"
                icon="⚙️"
              />

              <SensorCard
                title="Power Usage"
                value={iotData.power_usage}
                unit="kW"
                icon="⚡"
              />

            </div>


            {/* Status */}

            <div className="mt-6 grid gap-5 md:grid-cols-3">

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                <p className="text-sm text-slate-400">
                  Machine Status
                </p>

                <p className="mt-3 text-xl font-bold text-green-400">
                  {iotData.machine_status}
                </p>

              </div>


              <div
                className={`rounded-xl border p-5 ${getRiskClass(
                  iotData.risk_level
                )}`}
              >

                <p className="text-sm">
                  Risk Level
                </p>

                <p className="mt-3 text-xl font-bold">
                  {iotData.risk_level}
                </p>

              </div>


              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                <p className="text-sm text-slate-400">
                  Sensor Status
                </p>

                <p className="mt-3 text-xl font-bold text-green-400">
                  CONNECTED
                </p>

              </div>

            </div>


            {/* Alert */}

            <div className="mt-6">

              {iotData.alert ? (

                <div className="rounded-xl border border-red-900 bg-red-950/30 p-5">

                  <p className="font-semibold text-red-400">
                    ⚠ IoT Alert
                  </p>

                  <p className="mt-2 text-sm text-red-300">
                    {iotData.alert}
                  </p>

                </div>

              ) : (

                <div className="rounded-xl border border-green-900 bg-green-950/20 p-5">

                  <p className="font-semibold text-green-400">
                    ✓ Machine Operating Normally
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    No abnormal sensor conditions
                    detected.
                  </p>

                </div>

              )}

            </div>

          </div>

        ) : (

          <div className="p-12 text-center text-slate-500">
            No IoT data available.
          </div>

        )}

      </div>

    </div>
  );
}


// Sensor Card

function SensorCard({
  title,
  value,
  unit,
  icon,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-400">
          {title}
        </p>

        <span className="text-xl">
          {icon}
        </span>

      </div>

      <div className="mt-4 flex items-baseline gap-2">

        <span className="text-3xl font-bold text-blue-400">
          {value}
        </span>

        {unit && (
          <span className="text-sm text-slate-500">
            {unit}
          </span>
        )}

      </div>

    </div>
  );
}

export default IoTMonitoring;