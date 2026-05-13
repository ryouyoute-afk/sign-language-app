import { useEffect, useRef, useState, useCallback } from "react";
import { Camera as CameraIcon, CameraOff, Loader } from "lucide-react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

// ASL heuristic classifier — runs entirely in the browser, no server needed
function classifyASL(landmarks) {
  const lm = landmarks;
  const tipAbovePip = (tip, pip) => lm[tip].y < lm[pip].y;
  const dist = (a, b) => Math.hypot(lm[a].x - lm[b].x, lm[a].y - lm[b].y);

  const thumbOut   = lm[4].x < lm[3].x;
  const indexUp    = tipAbovePip(8, 6);
  const middleUp   = tipAbovePip(12, 10);
  const ringUp     = tipAbovePip(16, 14);
  const pinkyUp    = tipAbovePip(20, 18);
  const thumbIndexClose  = dist(4, 8)  < 0.07;

  if (!indexUp && !middleUp && !ringUp && !pinkyUp && thumbOut)           return ["A", 0.75];
  if ( indexUp &&  middleUp &&  ringUp &&  pinkyUp && !thumbOut)          return ["B", 0.80];
  if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbOut)          return ["E", 0.70];
  if ( indexUp && !middleUp && !ringUp && !pinkyUp && thumbOut)           return ["L", 0.80];
  if (!indexUp && !middleUp && !ringUp &&  pinkyUp && !thumbOut)          return ["I", 0.80];
  if ( thumbOut && !indexUp && !middleUp && !ringUp &&  pinkyUp)          return ["Y", 0.82];
  if ( indexUp &&  middleUp && !ringUp && !pinkyUp && dist(8,12) < 0.05) return ["U", 0.75];
  if ( indexUp &&  middleUp && !ringUp && !pinkyUp && dist(8,12) > 0.06) return ["V", 0.78];
  if ( indexUp &&  middleUp &&  ringUp && !pinkyUp)                       return ["W", 0.76];
  if (thumbIndexClose &&  middleUp &&  ringUp &&  pinkyUp)                return ["F", 0.75];
  if (thumbIndexClose && !middleUp && !ringUp && !pinkyUp)                return ["O", 0.72];
  if ( indexUp && !middleUp && !ringUp && !pinkyUp && !thumbOut)          return ["D", 0.70];
  if ( indexUp &&  middleUp &&  ringUp &&  pinkyUp &&  thumbOut)          return ["5 (Open)", 0.85];

  return ["?", 0.0];
}

export default function Camera({ onResult }) {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const landmarkerRef = useRef(null);
  const animRef       = useRef(null);
  const historyRef    = useRef([]);

  const [camOn,   setCamOn]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Load MediaPipe hand model once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const hl = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        if (!cancelled) landmarkerRef.current = hl;
      } catch (e) {
        console.error("MediaPipe load error:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const startCam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCamOn(true);
    } catch {
      setError("Camera access denied. Please allow camera permissions and try again.");
    }
    setLoading(false);
  }, []);

  const stopCam = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
    onResult({ detected: false, letter: null, confidence: 0, history: [] });
  }, [onResult]);

  // Detection loop
  useEffect(() => {
    if (!camOn) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const HISTORY = 5;

    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],[0,17],
    ];

    const detect = () => {
      if (!video || video.readyState < 2 || !landmarkerRef.current) {
        animRef.current = requestAnimationFrame(detect);
        return;
      }

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror the video feed
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0);
      ctx.restore();

      const results = landmarkerRef.current.detectForVideo(video, performance.now());

      if (results.landmarks?.length > 0) {
        const lm = results.landmarks[0];

        // Draw skeleton lines
        ctx.strokeStyle = "#0ea5e9";
        ctx.lineWidth   = 2;
        for (const [a, b] of CONNECTIONS) {
          ctx.beginPath();
          ctx.moveTo((1 - lm[a].x) * canvas.width, lm[a].y * canvas.height);
          ctx.lineTo((1 - lm[b].x) * canvas.width, lm[b].y * canvas.height);
          ctx.stroke();
        }
        // Draw landmark dots
        ctx.fillStyle = "#38bdf8";
        for (const p of lm) {
          ctx.beginPath();
          ctx.arc((1 - p.x) * canvas.width, p.y * canvas.height, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        const [letter, conf] = classifyASL(lm);
        historyRef.current.push(letter);
        if (historyRef.current.length > HISTORY * 3) {
          historyRef.current = historyRef.current.slice(-(HISTORY * 3));
        }
        const recent = historyRef.current.slice(-HISTORY);
        const stable = recent.reduce((a, b, _, arr) =>
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        const stableConf = recent.filter(l => l === stable).length / recent.length;

        onResult({ detected: true, letter: stable, raw_letter: letter, confidence: stableConf, history: recent });
      } else {
        historyRef.current = [];
        onResult({ detected: false, letter: null, confidence: 0, history: [] });
      }

      animRef.current = requestAnimationFrame(detect);
    };

    animRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animRef.current);
  }, [camOn, onResult]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 aspect-video max-w-2xl w-full">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {!camOn && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
            <CameraIcon size={48} className="text-slate-600" />
            <p className="text-slate-400 text-sm">Camera is off</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <Loader size={32} className="text-sky-400 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 p-6">
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}
      </div>

      <button
        onClick={camOn ? stopCam : startCam}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          camOn
            ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            : "bg-sky-500 hover:bg-sky-600 text-white"
        } disabled:opacity-50`}
      >
        {camOn ? <CameraOff size={16} /> : <CameraIcon size={16} />}
        {loading ? "Starting…" : camOn ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
}
