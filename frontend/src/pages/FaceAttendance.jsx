import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

function FaceAttendance() {
  // =====================================================
  // REFS
  // =====================================================

  const previewCanvasRef = useRef(null);

  const streamRef = useRef(null);

  const previewTrackRef = useRef(null);

  const processorRef = useRef(null);

  const readerRef = useRef(null);

  const previewRunningRef = useRef(false);

  // =====================================================
  // STATE
  // =====================================================

  const [modelsLoaded, setModelsLoaded] =
    useState(false);

  const [cameraStarted, setCameraStarted] =
    useState(false);

  const [workerId, setWorkerId] =
    useState("");

  const [workerName, setWorkerName] =
    useState("");

  const [message, setMessage] = useState(
    "Loading face recognition models..."
  );

  const [recognizedWorker, setRecognizedWorker] =
    useState(null);

  const [attendanceMarked, setAttendanceMarked] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  // =====================================================
  // LOAD FACE MODELS
  // =====================================================

  useEffect(() => {
    const loadModels = async () => {
      try {
        setMessage(
          "Loading face recognition models..."
        );

        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models"
        );

        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models"
        );

        await faceapi.nets.faceRecognitionNet.loadFromUri(
          "/models"
        );

        setModelsLoaded(true);

        setMessage(
          "Face Recognition Engine Ready."
        );

        console.log(
          "FACE MODELS LOADED"
        );
      } catch (error) {
        console.error(
          "MODEL ERROR:",
          error
        );

        setMessage(
          "Failed to load face recognition models."
        );
      }
    };

    loadModels();
  }, []);

  // =====================================================
  // STOP PREVIEW PROCESSOR
  // =====================================================

  const stopPreviewProcessor = async () => {
    previewRunningRef.current = false;

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {}

      readerRef.current = null;
    }

    if (previewTrackRef.current) {
      try {
        previewTrackRef.current.stop();
      } catch {}

      previewTrackRef.current = null;
    }

    processorRef.current = null;
  };

  // =====================================================
  // START CAMERA
  // =====================================================

  const startCamera = async () => {
    try {
      setMessage(
        "Starting laptop camera..."
      );

      // Stop old camera
      await stopPreviewProcessor();

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch {}
          });

        streamRef.current = null;
      }

      // -------------------------------------------------
      // GET CAMERA
      // -------------------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 640,
            },

            height: {
              ideal: 480,
            },

            facingMode: "user",
          },

          audio: false,
        });

      streamRef.current =
        stream;

      const originalTrack =
        stream.getVideoTracks()[0];

      if (!originalTrack) {
        throw new Error(
          "No camera video track found."
        );
      }

      console.log(
        "CAMERA:",
        originalTrack.label
      );

      console.log(
        "CAMERA SETTINGS:",
        originalTrack.getSettings()
      );

      // -------------------------------------------------
      // CHECK MEDIA STREAM PROCESSOR
      // -------------------------------------------------

      if (
        !("MediaStreamTrackProcessor" in window)
      ) {
        throw new Error(
          "Your browser does not support MediaStreamTrackProcessor."
        );
      }

      // IMPORTANT:
      // Clone the track so the preview processor
      // does not consume the original camera track.
      const previewTrack =
        originalTrack.clone();

      previewTrackRef.current =
        previewTrack;

      const processor =
        new MediaStreamTrackProcessor({
          track: previewTrack,
        });

      processorRef.current =
        processor;

      const reader =
        processor.readable.getReader();

      readerRef.current =
        reader;

      previewRunningRef.current =
        true;

      setCameraStarted(true);

      setMessage(
        "Camera connected. Position your face in front of the camera."
      );

      console.log(
        "LIVE CAMERA PROCESSOR STARTED"
      );

      // -------------------------------------------------
      // LIVE PREVIEW LOOP
      // -------------------------------------------------

      const drawFrames = async () => {
        while (
          previewRunningRef.current
        ) {
          let result;

          try {
            result =
              await reader.read();
          } catch (error) {
            console.error(
              "FRAME READ ERROR:",
              error
            );

            break;
          }

          if (
            !result ||
            result.done ||
            !result.value
          ) {
            break;
          }

          const frame =
            result.value;

          try {
            const canvas =
              previewCanvasRef.current;

            if (!canvas) {
              frame.close();
              continue;
            }

            const width =
              frame.displayWidth ||
              frame.codedWidth;

            const height =
              frame.displayHeight ||
              frame.codedHeight;

            if (
              width < 10 ||
              height < 10
            ) {
              console.warn(
                "INVALID FRAME:",
                width,
                height
              );

              frame.close();
              continue;
            }

            // Set actual camera dimensions
            if (
              canvas.width !== width
            ) {
              canvas.width =
                width;
            }

            if (
              canvas.height !== height
            ) {
              canvas.height =
                height;
            }

            const context =
              canvas.getContext(
                "2d"
              );

            context.drawImage(
              frame,
              0,
              0,
              width,
              height
            );

            console.log(
              "LIVE FRAME:",
              width,
              "x",
              height
            );
          } catch (error) {
            console.error(
              "FRAME DRAW ERROR:",
              error
            );
          } finally {
            frame.close();
          }
        }
      };

      drawFrames();

    } catch (error) {
      console.error(
        "CAMERA ERROR:",
        error
      );

      await stopPreviewProcessor();

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch {}
          });

        streamRef.current = null;
      }

      setCameraStarted(false);

      setMessage(
        `Camera error: ${error.message}`
      );
    }
  };

  // =====================================================
  // STOP CAMERA
  // =====================================================

  const stopCamera = async () => {
    await stopPreviewProcessor();

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch {}
        });

      streamRef.current = null;
    }

    const canvas =
      previewCanvasRef.current;

    if (canvas) {
      const context =
        canvas.getContext("2d");

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    setCameraStarted(false);

    setMessage(
      "Camera stopped."
    );

    console.log(
      "CAMERA STOPPED"
    );
  };

  // =====================================================
  // GET CURRENT CAMERA FRAME
  // =====================================================

  const getCurrentCameraCanvas = () => {
    if (!cameraStarted) {
      throw new Error(
        "Camera is not started."
      );
    }

    const canvas =
      previewCanvasRef.current;

    if (!canvas) {
      throw new Error(
        "Camera preview is not available."
      );
    }

    if (
      canvas.width < 10 ||
      canvas.height < 10
    ) {
      throw new Error(
        "Camera frame is not ready yet. Wait one second and try again."
      );
    }

    console.log(
      "CAPTURED LIVE CAMERA FRAME:",
      canvas.width,
      "x",
      canvas.height
    );

    return canvas;
  };

  // =====================================================
  // FACE DESCRIPTOR
  // =====================================================

  const getFaceDescriptor =
    async (image) => {
      const detection =
        await faceapi
          .detectSingleFace(
            image,
            new faceapi.TinyFaceDetectorOptions(
              {
                inputSize: 224,
                scoreThreshold: 0.4,
              }
            )
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

      if (!detection) {
        throw new Error(
          "No face detected. Look directly at the camera."
        );
      }

      return detection.descriptor;
    };

  // =====================================================
  // REGISTER FACE FROM LIVE CAMERA
  // =====================================================

  const registerFaceFromCamera =
    async () => {
      if (!modelsLoaded) {
        setMessage(
          "Face recognition models are still loading."
        );
        return;
      }

      if (!cameraStarted) {
        setMessage(
          "Start the camera first."
        );
        return;
      }

      if (!workerId.trim()) {
        setMessage(
          "Enter Worker ID."
        );
        return;
      }

      if (!workerName.trim()) {
        setMessage(
          "Enter Worker Name."
        );
        return;
      }

      try {
        setProcessing(true);

        setMessage(
          "Capturing live camera frame..."
        );

        // Small delay to ensure latest frame
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 300)
        );

        const canvas =
          getCurrentCameraCanvas();

        setMessage(
          "Detecting face..."
        );

        const descriptor =
          await getFaceDescriptor(
            canvas
          );

        const worker = {
          workerId:
            workerId.trim(),

          workerName:
            workerName.trim(),

          descriptor:
            Array.from(
              descriptor
            ),

          registeredAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          `face_worker_${worker.workerId}`,
          JSON.stringify(worker)
        );

        setRecognizedWorker({
          workerId:
            worker.workerId,

          workerName:
            worker.workerName,

          confidence: 100,
        });

        setAttendanceMarked(
          false
        );

        setMessage(
          `Face registered successfully for ${worker.workerName}.`
        );

        console.log(
          "LIVE CAMERA FACE REGISTERED:",
          worker
        );
      } catch (error) {
        console.error(
          "LIVE REGISTRATION ERROR:",
          error
        );

        setMessage(
          `Face registration failed: ${error.message}`
        );
      } finally {
        setProcessing(false);
      }
    };

  // =====================================================
  // RECOGNIZE FACE FROM LIVE CAMERA
  // =====================================================

  const recognizeFace =
    async () => {
      if (!modelsLoaded) {
        setMessage(
          "Face recognition models are still loading."
        );
        return;
      }

      if (!cameraStarted) {
        setMessage(
          "Start the camera first."
        );
        return;
      }

      try {
        setProcessing(true);

        setMessage(
          "Capturing live camera frame..."
        );

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 300)
        );

        const canvas =
          getCurrentCameraCanvas();

        setMessage(
          "Detecting face..."
        );

        const currentDescriptor =
          await getFaceDescriptor(
            canvas
          );

        // -------------------------------------------------
        // LOAD REGISTERED WORKERS
        // -------------------------------------------------

        const workers = [];

        for (
          let i = 0;
          i < localStorage.length;
          i++
        ) {
          const key =
            localStorage.key(i);

          if (
            key &&
            key.startsWith(
              "face_worker_"
            )
          ) {
            try {
              const worker =
                JSON.parse(
                  localStorage.getItem(
                    key
                  )
                );

              if (
                worker &&
                Array.isArray(
                  worker.descriptor
                )
              ) {
                workers.push(
                  worker
                );
              }
            } catch {
              console.warn(
                "Invalid worker record:",
                key
              );
            }
          }
        }

        if (
          workers.length === 0
        ) {
          setMessage(
            "No registered workers found. Register a worker first."
          );

          return;
        }

        // -------------------------------------------------
        // FIND BEST MATCH
        // -------------------------------------------------

        let bestWorker =
          null;

        let bestDistance =
          Infinity;

        for (
          const worker of workers
        ) {
          const storedDescriptor =
            new Float32Array(
              worker.descriptor
            );

          const distance =
            faceapi.euclideanDistance(
              currentDescriptor,
              storedDescriptor
            );

          console.log(
            `${worker.workerName} distance:`,
            distance
          );

          if (
            distance <
            bestDistance
          ) {
            bestDistance =
              distance;

            bestWorker =
              worker;
          }
        }

        // -------------------------------------------------
        // MATCH
        // -------------------------------------------------

        const recognitionThreshold =
          0.55;

        if (
          bestWorker &&
          bestDistance <=
            recognitionThreshold
        ) {
          const confidence =
            Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  (1 -
                    bestDistance) *
                    100
                )
              )
            );

          setRecognizedWorker({
            workerId:
              bestWorker.workerId,

            workerName:
              bestWorker.workerName,

            confidence,
          });

          setAttendanceMarked(
            false
          );

          setMessage(
            `Face recognized: ${bestWorker.workerName}`
          );

          console.log(
            "FACE RECOGNIZED:",
            bestWorker.workerName
          );

          console.log(
            "DISTANCE:",
            bestDistance
          );

          console.log(
            "CONFIDENCE:",
            confidence
          );
        } else {
          setRecognizedWorker(
            null
          );

          setAttendanceMarked(
            false
          );

          setMessage(
            "Face not recognized."
          );
        }
      } catch (error) {
        console.error(
          "LIVE RECOGNITION ERROR:",
          error
        );

        setMessage(
          `Face recognition failed: ${error.message}`
        );
      } finally {
        setProcessing(false);
      }
    };

  // =====================================================
  // OPTIONAL IMAGE REGISTRATION FALLBACK
  // =====================================================

  const handleRegisterImage =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!modelsLoaded) {
        setMessage(
          "Face recognition models are still loading."
        );
        return;
      }

      if (!workerId.trim()) {
        setMessage(
          "Enter Worker ID first."
        );
        return;
      }

      if (!workerName.trim()) {
        setMessage(
          "Enter Worker Name first."
        );
        return;
      }

      try {
        setProcessing(true);

        setMessage(
          "Processing face image..."
        );

        const image =
          await faceapi.bufferToImage(
            file
          );

        const descriptor =
          await getFaceDescriptor(
            image
          );

        const worker = {
          workerId:
            workerId.trim(),

          workerName:
            workerName.trim(),

          descriptor:
            Array.from(
              descriptor
            ),

          registeredAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          `face_worker_${worker.workerId}`,
          JSON.stringify(worker)
        );

        setRecognizedWorker({
          workerId:
            worker.workerId,

          workerName:
            worker.workerName,

          confidence: 100,
        });

        setAttendanceMarked(
          false
        );

        setMessage(
          `Face registered successfully for ${worker.workerName}.`
        );
      } catch (error) {
        console.error(
          "IMAGE REGISTRATION ERROR:",
          error
        );

        setMessage(
          `Face registration failed: ${error.message}`
        );
      } finally {
        setProcessing(false);
        event.target.value = "";
      }
    };

  // =====================================================
  // OPTIONAL IMAGE RECOGNITION FALLBACK
  // =====================================================

  const handleRecognizeImage =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!modelsLoaded) {
        setMessage(
          "Face recognition models are still loading."
        );
        return;
      }

      try {
        setProcessing(true);

        setMessage(
          "Analyzing face image..."
        );

        const image =
          await faceapi.bufferToImage(
            file
          );

        const currentDescriptor =
          await getFaceDescriptor(
            image
          );

        const workers = [];

        for (
          let i = 0;
          i < localStorage.length;
          i++
        ) {
          const key =
            localStorage.key(i);

          if (
            key &&
            key.startsWith(
              "face_worker_"
            )
          ) {
            try {
              const worker =
                JSON.parse(
                  localStorage.getItem(
                    key
                  )
                );

              if (
                worker &&
                Array.isArray(
                  worker.descriptor
                )
              ) {
                workers.push(
                  worker
                );
              }
            } catch {}
          }
        }

        if (
          workers.length === 0
        ) {
          setMessage(
            "No registered workers found."
          );

          return;
        }

        let bestWorker =
          null;

        let bestDistance =
          Infinity;

        for (
          const worker of workers
        ) {
          const storedDescriptor =
            new Float32Array(
              worker.descriptor
            );

          const distance =
            faceapi.euclideanDistance(
              currentDescriptor,
              storedDescriptor
            );

          if (
            distance <
            bestDistance
          ) {
            bestDistance =
              distance;

            bestWorker =
              worker;
          }
        }

        if (
          bestWorker &&
          bestDistance <=
            0.55
        ) {
          const confidence =
            Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  (1 -
                    bestDistance) *
                    100
                )
              )
            );

          setRecognizedWorker({
            workerId:
              bestWorker.workerId,

            workerName:
              bestWorker.workerName,

            confidence,
          });

          setAttendanceMarked(
            false
          );

          setMessage(
            `Face recognized: ${bestWorker.workerName}`
          );
        } else {
          setRecognizedWorker(
            null
          );

          setMessage(
            "Face not recognized."
          );
        }
      } catch (error) {
        console.error(
          "IMAGE RECOGNITION ERROR:",
          error
        );

        setMessage(
          `Face recognition failed: ${error.message}`
        );
      } finally {
        setProcessing(false);
        event.target.value = "";
      }
    };

  // =====================================================
  // MARK ATTENDANCE
  // =====================================================

  const markAttendance = () => {
    if (!recognizedWorker) {
      setMessage(
        "Recognize a worker first."
      );
      return;
    }

    const now =
      new Date();

    const attendanceRecord = {
      workerId:
        recognizedWorker.workerId,

      workerName:
        recognizedWorker.workerName,

      date:
        now.toISOString()
          .split("T")[0],

      time:
        now.toLocaleTimeString(),

      status:
        "PRESENT",
    };

    const existing =
      JSON.parse(
        localStorage.getItem(
          "face_attendance"
        ) || "[]"
      );

    existing.push(
      attendanceRecord
    );

    localStorage.setItem(
      "face_attendance",
      JSON.stringify(
        existing
      )
    );

    setAttendanceMarked(
      true
    );

    setMessage(
      `Attendance marked successfully for ${recognizedWorker.workerName}.`
    );

    console.log(
      "ATTENDANCE MARKED:",
      attendanceRecord
    );
  };

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      previewRunningRef.current =
        false;

      if (
        readerRef.current
      ) {
        readerRef.current
          .cancel()
          .catch(() => {});
      }

      if (
        previewTrackRef.current
      ) {
        previewTrackRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch {}
          });
      }
    };
  }, []);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
          AI / ATTENDANCE
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Face Recognition Attendance
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Register workers and mark attendance using live camera face recognition.
        </p>

      </div>

      {/* ENGINE STATUS */}

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

        <div className="flex items-center gap-3">

          <span
            className={`h-3 w-3 rounded-full ${
              modelsLoaded
                ? "bg-green-400"
                : "bg-yellow-400"
            }`}
          />

          <div>

            <p className="font-semibold">
              Face Recognition Engine
            </p>

            <p className="text-sm text-slate-400">
              {modelsLoaded
                ? "Ready"
                : "Loading models..."}
            </p>

          </div>

        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* =================================================
            LIVE CAMERA
        ================================================= */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            CAMERA
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Live Face Scanner
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Use the laptop camera to register and recognize workers.
          </p>

          {/* CAMERA CANVAS */}

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-700 bg-black">

            <canvas
              ref={previewCanvasRef}
              className="block aspect-video h-auto w-full bg-black object-cover"
            />

          </div>

          {/* CAMERA STATUS */}

          <p
            className={`mt-4 text-sm ${
              cameraStarted
                ? "text-green-400"
                : "text-slate-400"
            }`}
          >
            {cameraStarted
              ? "● Camera Connected"
              : "○ Camera Not Started"}
          </p>

          {/* CAMERA BUTTONS */}

          <div className="mt-4 flex flex-wrap gap-3">

            {!cameraStarted ? (

              <button
                onClick={startCamera}
                disabled={
                  !modelsLoaded ||
                  processing
                }
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start Camera
              </button>

            ) : (

              <button
                onClick={stopCamera}
                disabled={processing}
                className="rounded-lg border border-red-600 px-5 py-3 font-semibold text-red-400 hover:bg-red-950/30"
              >
                Stop Camera
              </button>

            )}

            <button
              onClick={recognizeFace}
              disabled={
                !modelsLoaded ||
                !cameraStarted ||
                processing
              }
              className="rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? "Processing..."
                : "Recognize Face"}
            </button>

          </div>

          {/* OPTIONAL FALLBACK */}

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">

            <p className="text-sm font-semibold">
              Backup Image Recognition
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Only use this if the laptop camera is unavailable.
            </p>

            <label className="mt-4 block cursor-pointer rounded-lg bg-purple-700 px-4 py-3 text-center font-semibold hover:bg-purple-800">

              Upload Face for Recognition

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleRecognizeImage
                }
                disabled={
                  !modelsLoaded ||
                  processing
                }
                className="hidden"
              />

            </label>

          </div>

        </div>

        {/* =================================================
            WORKER REGISTRATION
        ================================================= */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
            WORKER REGISTRATION
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Register Worker Face
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Enter worker details and register the face using the live camera.
          </p>

          <div className="mt-6 space-y-5">

            {/* WORKER ID */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Worker ID
              </label>

              <input
                value={workerId}
                onChange={(e) =>
                  setWorkerId(
                    e.target.value
                  )
                }
                placeholder="Example: W001"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>

            {/* WORKER NAME */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Worker Name
              </label>

              <input
                value={workerName}
                onChange={(e) =>
                  setWorkerName(
                    e.target.value
                  )
                }
                placeholder="Example: Rohith"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>

            {/* LIVE CAMERA REGISTER */}

            <button
              onClick={
                registerFaceFromCamera
              }
              disabled={
                !modelsLoaded ||
                !cameraStarted ||
                processing
              }
              className="w-full rounded-lg bg-green-600 py-3 font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? "Capturing..."
                : "Register Face From Camera"}
            </button>

            {/* BACKUP IMAGE REGISTER */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Backup Face Image
              </label>

              <label className="block cursor-pointer rounded-lg border border-dashed border-green-600 bg-slate-950 px-4 py-4 text-center hover:bg-slate-800">

                <span className="font-semibold text-green-400">
                  Choose Face Image
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  Backup option only
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleRegisterImage
                  }
                  disabled={
                    !modelsLoaded ||
                    processing
                  }
                  className="hidden"
                />

              </label>

            </div>

          </div>

        </div>

      </div>

      {/* MESSAGE */}

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

        <p className="text-sm text-slate-300">
          {message}
        </p>

      </div>

      {/* ATTENDANCE RESULT */}

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          ATTENDANCE RESULT
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Recognized Worker
        </h2>

        {recognizedWorker ? (

          <div className="mt-5 grid gap-5 md:grid-cols-3">

            {/* WORKER */}

            <div className="rounded-xl bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                Worker
              </p>

              <p className="mt-2 text-xl font-bold text-blue-400">
                {
                  recognizedWorker.workerName
                }
              </p>

            </div>

            {/* ID */}

            <div className="rounded-xl bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                Worker ID
              </p>

              <p className="mt-2 text-xl font-bold">
                {
                  recognizedWorker.workerId
                }
              </p>

            </div>

            {/* CONFIDENCE */}

            <div className="rounded-xl bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                Confidence
              </p>

              <p className="mt-2 text-xl font-bold text-green-400">
                {
                  recognizedWorker.confidence
                }%
              </p>

            </div>

          </div>

        ) : (

          <p className="mt-5 text-sm text-slate-500">
            No worker recognized yet.
          </p>

        )}

        {/* MARK ATTENDANCE */}

        {recognizedWorker && (

          <button
            onClick={
              markAttendance
            }
            disabled={
              attendanceMarked
            }
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {attendanceMarked
              ? "✓ Attendance Marked"
              : "Mark Attendance"}
          </button>

        )}

      </div>

    </div>
  );
}

export default FaceAttendance;