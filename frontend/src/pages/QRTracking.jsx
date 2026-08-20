import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

import {
  getMachineryQRData,
  lookupQRAsset,
} from "../services/qrTrackingService";

function QRTracking() {
  const [assetType, setAssetType] = useState("MACHINERY");
  const [assetId, setAssetId] = useState("");
  const [qrData, setQrData] = useState(null);
  const [scannedAsset, setScannedAsset] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scannerRef = useRef(null);

  // ==================================================
  // GENERATE MACHINE QR DATA
  // ==================================================

  const generateMachineQR = async () => {
    if (!assetId) {
      setError("Please enter a machinery ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setScannedAsset(null);

      const data =
        await getMachineryQRData(assetId);

      setQrData(data);
    } catch (error) {
      console.error(
        "QR generation error:",
        error
      );

      setError(
        error?.response?.data?.detail ||
          "Machinery not found."
      );

      setQrData(null);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // DOWNLOAD QR
  // ==================================================

  const downloadQR = () => {
    const canvas =
      document.getElementById("machine-qr");

    if (!canvas) {
      return;
    }

    const image =
      canvas.toDataURL("image/png");

    const link =
      document.createElement("a");

    link.href = image;

    link.download = `${
      qrData?.machine_code ||
      "machinery"
    }-QR.png`;

    link.click();
  };

  // ==================================================
  // QR SCANNER
  // ==================================================

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        console.log(
          "QR Scanned:",
          decodedText
        );

        try {
          setError("");

          let parsedData;

          try {
            parsedData =
              JSON.parse(decodedText);
          } catch {
            throw new Error(
              "Invalid factory QR code."
            );
          }

          if (
            parsedData.asset_type !==
            "MACHINERY"
          ) {
            throw new Error(
              "Unsupported QR asset type."
            );
          }

          if (!parsedData.asset_id) {
            throw new Error(
              "Invalid machinery QR code."
            );
          }

          const data =
            await lookupQRAsset(
              parsedData.asset_type,
              parsedData.asset_id
            );

          setScannedAsset(data);

          await scanner.clear();
        } catch (error) {
          console.error(
            "QR scan error:",
            error
          );

          setError(
            error?.response?.data?.detail ||
              error.message ||
              "Unable to read QR code."
          );
        }
      },
      (scanError) => {
        // Scanner continuously reports
        // positioning errors while searching.
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner
        .clear()
        .catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          OPERATIONS
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          QR Tracking
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Generate and scan QR codes for factory
          machinery.
        </p>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-5 py-4 text-sm text-red-400">
          {error}
        </div>
      )}


      {/* ==================================================
          GENERATE QR
      ================================================== */}

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 px-6 py-5">

          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
            QR GENERATOR
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Generate Machinery QR Code
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Enter the machinery ID to generate
            its factory QR code.
          </p>

        </div>


        <div className="grid gap-6 p-6 lg:grid-cols-2">

          {/* FORM */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Asset Type
            </label>

            <select
              value={assetType}
              onChange={(e) =>
                setAssetType(e.target.value)
              }
              className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="MACHINERY">
                Machinery
              </option>
            </select>


            <label className="mb-2 block text-sm font-medium text-slate-300">
              Machinery ID
            </label>

            <input
              type="number"
              min="1"
              value={assetId}
              onChange={(e) =>
                setAssetId(e.target.value)
              }
              placeholder="Example: 1"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />


            <button
              onClick={generateMachineQR}
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Generating..."
                : "Generate QR Code"}
            </button>

          </div>


          {/* QR RESULT */}

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-6">

            {qrData ? (

              <>
                <div className="rounded-xl bg-white p-5">

                  <QRCodeCanvas
                    id="machine-qr"
                    value={JSON.stringify({
                      asset_type:
                        "MACHINERY",
                      asset_id:
                        qrData.asset_id,
                    })}
                    size={220}
                    level="H"
                  />

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {qrData.machine_name}
                </h3>

                <p className="mt-1 font-mono text-sm text-slate-400">
                  {qrData.machine_code}
                </p>

                <button
                  onClick={downloadQR}
                  className="mt-5 rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-700"
                >
                  Download QR
                </button>

              </>

            ) : (

              <div className="py-16 text-center text-slate-500">

                <div className="mb-4 text-5xl">
                  ▦
                </div>

                <p>
                  Generate a QR code to see it
                  here.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ==================================================
          QR SCANNER
      ================================================== */}

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 px-6 py-5">

          <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
            QR SCANNER
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Scan Factory QR Code
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Use your camera to scan a machinery
            QR code.
          </p>

        </div>


        <div className="grid gap-6 p-6 lg:grid-cols-2">

          {/* CAMERA */}

          <div>

            <div
              id="qr-reader"
              className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
            />

          </div>


          {/* SCANNED RESULT */}

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">

            <h3 className="mb-5 text-lg font-semibold">
              Scanned Machine
            </h3>

            {scannedAsset ? (

              <div className="space-y-4">

                <InfoRow
                  label="Machine Code"
                  value={
                    scannedAsset.machine_code
                  }
                />

                <InfoRow
                  label="Machine Name"
                  value={
                    scannedAsset.machine_name
                  }
                />

                <InfoRow
                  label="Machine Type"
                  value={
                    scannedAsset.machine_type
                  }
                />

                <InfoRow
                  label="Status"
                  value={
                    scannedAsset.machine_status
                  }
                />

                <InfoRow
                  label="Running Hours"
                  value={`${Number(
                    scannedAsset.running_hours ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )} hrs`}
                />

                <InfoRow
                  label="Purchase Date"
                  value={
                    scannedAsset.purchase_date
                  }
                />

                <InfoRow
                  label="Warranty Expiry"
                  value={
                    scannedAsset.warranty_expiry ||
                    "Not specified"
                  }
                />

                <div className="mt-5 rounded-lg border border-green-900 bg-green-950/30 p-4 text-sm text-green-400">
                  ✓ Machinery successfully
                  identified.
                </div>

              </div>

            ) : (

              <div className="py-12 text-center text-slate-500">

                <div className="mb-4 text-4xl">
                  📷
                </div>

                <p>
                  Scan a QR code to display
                  machinery details.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}


// ==================================================
// INFO ROW
// ==================================================

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-white">
        {value}
      </span>

    </div>
  );
}

export default QRTracking;