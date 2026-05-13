import { useEffect, useRef, useState, useCallback } from "react";
import { Camera as CameraIcon, CameraOff, Wifi, WifiOff } from "lucide-react";

const WS_URL = "ws://localhost:8000/ws/recognize";
const FPS = 15;

export default function Camera({ onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const annotatedRef = useRef(null);

  const [camOn, setCamOn] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect WebSocket
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setTimeout(connectWS, 2000); };
    ws.onerror = () => ws.close();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "result") {
        if (msg.annotated_frame) annotatedRef.current = msg.annotated_frame;
        onResult(msg);
      }
    };
    wsRef.current = ws;
  }, [onResult]);

  // Start webcam
  const startCam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCamOn(true);
        setError(null);
      }
    } catch (e) {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCam = useCallback(() => {
    videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    clearInterval(intervalRef.current);
    setCamOn(false);
  }, []);

  // Send frames
  useEffect(() => {
    if (!camOn) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    intervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const b64 = canvas.toDataURL("image/jpeg", 0.7);
      wsRef.current.send(JSON.stringify({ type: "frame", frame: b64 }));
    }, 1000 / FPS);

    return () => clearInterval(intervalRef.current);
  }, [camOn]);

  useEffect(() => {
    connectWS();
    return () => wsRef.current?.close();
  }, [connectWS]);

  // Draw annotated frame overlay
  useEffect(() => {
    if (!camOn) return;
    let raf;
    const display = document.getElementById("cam-display");
    const draw = () => {
      if (annotatedRef.current && display) {
        const img = new Image();
        img.onload = () => {
          const ctx2 = display.getContext("2d");
          ctx2.save();
          ctx2.scale(-1, 1);
          ctx2.drawImage(img, -display.width, 0, display.width, display.height);
          ctx2.restore();
        };
        img.src = annotatedRef.current;
      } else if (videoRef.current && display) {
        const ctx2 = display.getContext("2d");
        ctx2.save();
        ctx2.scale(-1, 1);
        ctx2.drawImage(videoRef.current, -display.width, 0, display.width, display.height);
        ctx2.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [camOn]);

  return (
    <div className="flex flex-col gap-3">
      {/* Status bar */}
      <div className="flex items-center gap-3 text-sm">
        <span className={`flex items-center gap-1 ${connected ? "text-green-400" : "text-red-400"}`}>
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {connected ? "Backend connected" : "Connecting…"}
        </span>
        <span className={`flex items-center gap-1 ${camOn ? "text-sky-400" : "text-slate-500"}`}>
          {camOn ? <CameraIcon size={14} /> : <CameraOff size={14} />}
          {camOn ? "Camera on" : "Camera off"}
        </span>
      </div>

      {/* Video display */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 aspect-video max-w-2xl w-full">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
        <canvas
          id="cam-display"
          width={640}
          height={480}
          className="w-full h-full object-cover"
        />
        {!camOn && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-slate-900/90">
            <CameraIcon size={48} className="text-slate-600" />
            <p className="text-slate-400 text-sm">Camera is off</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 p-6">
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <button
        onClick={camOn ? stopCam : startCam}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          camOn
            ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            : "bg-sky-500 hover:bg-sky-600 text-white glow"
        }`}
      >
        {camOn ? <CameraOff size={16} /> : <CameraIcon size={16} />}
        {camOn ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
}
