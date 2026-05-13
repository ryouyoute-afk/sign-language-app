import { useState, useEffect, useRef } from "react";
import { Trophy, RefreshCw, Target } from "lucide-react";
import Camera from "./Camera";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const HOLD_SECONDS = 2;

function randomLetter(exclude) {
  const pool = ALPHABET.filter((l) => l !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function PracticeMode() {
  const [target, setTarget] = useState(() => randomLetter(null));
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | holding | success | fail
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStart = useRef(null);
  const rafRef = useRef(null);

  const nextTarget = () => {
    setTarget((t) => randomLetter(t));
    setStatus("idle");
    setHoldProgress(0);
    holdStart.current = null;
  };

  // Watch incoming result
  useEffect(() => {
    if (!result?.detected || status === "success") return;

    const letter = result.letter;
    const conf = result.confidence ?? 0;

    if (letter === target && conf >= 0.65) {
      // Start / continue hold timer
      if (!holdStart.current) holdStart.current = Date.now();
      setStatus("holding");

      const tick = () => {
        const elapsed = (Date.now() - holdStart.current) / 1000;
        const pct = Math.min(elapsed / HOLD_SECONDS, 1);
        setHoldProgress(pct);

        if (pct >= 1) {
          setStatus("success");
          setScore((s) => s + 1);
          setStreak((s) => s + 1);
          setTimeout(nextTarget, 1200);
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      holdStart.current = null;
      setStatus("idle");
      setHoldProgress(0);
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, target]);

  const statusColor = {
    idle: "border-slate-700 bg-slate-900",
    holding: "border-yellow-500/60 bg-yellow-500/5",
    success: "border-green-500/60 bg-green-500/10 glow-green",
    fail: "border-red-500/40 bg-red-500/5",
  }[status];

  return (
    <div className="flex flex-col gap-6">
      {/* Score bar */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800">
          <Trophy size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold text-slate-200">Score: {score}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800">
          <Target size={16} className="text-sky-400" />
          <span className="text-sm font-semibold text-slate-200">Streak: {streak}</span>
        </div>
        <button
          onClick={() => { setScore(0); setStreak(0); nextTarget(); }}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      {/* Target + progress */}
      <div className={`rounded-2xl border p-6 text-center transition-all duration-300 ${statusColor}`}>
        <p className="text-sm text-slate-500 mb-1">Sign this letter:</p>
        <div className="text-9xl font-bold tracking-tight text-white">{target}</div>

        {/* Hold progress bar */}
        <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-none"
            style={{ width: `${holdProgress * 100}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {status === "idle" && "Show the sign and hold it steady"}
          {status === "holding" && `Hold still… ${Math.ceil(HOLD_SECONDS - holdProgress * HOLD_SECONDS)}s`}
          {status === "success" && "🎉 Correct! Next letter…"}
        </p>
      </div>

      {/* Camera */}
      <Camera onResult={setResult} />
    </div>
  );
}
