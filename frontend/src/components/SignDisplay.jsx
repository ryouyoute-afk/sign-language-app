import { useEffect, useRef, useState } from "react";

const CONFIDENCE_COLORS = {
  high: "text-green-400 border-green-500/40 bg-green-500/10 glow-green",
  mid: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  low: "text-slate-500 border-slate-700 bg-slate-800/50",
};

function confLevel(conf) {
  if (conf >= 0.7) return "high";
  if (conf >= 0.4) return "mid";
  return "low";
}

export default function SignDisplay({ result }) {
  const [sentence, setSentence] = useState("");
  const [lastAdded, setLastAdded] = useState(null);
  const holdRef = useRef(null);

  const letter = result?.letter;
  const conf = result?.confidence ?? 0;
  const detected = result?.detected;
  const level = confLevel(detected ? conf : 0);

  // Auto-type: hold a stable high-confidence letter for 1.5 s → append to sentence
  useEffect(() => {
    if (!detected || conf < 0.75 || !letter || letter === "?") {
      clearTimeout(holdRef.current);
      return;
    }
    clearTimeout(holdRef.current);
    holdRef.current = setTimeout(() => {
      if (letter !== lastAdded) {
        setSentence((s) => s + (letter === "5 (Open Hand)" ? " " : letter));
        setLastAdded(letter);
      }
    }, 1500);
    return () => clearTimeout(holdRef.current);
  }, [letter, conf, detected, lastAdded]);

  return (
    <div className="flex flex-col gap-4">
      {/* Big letter display */}
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border p-8 transition-all duration-300 ${
          CONFIDENCE_COLORS[level]
        }`}
      >
        <div className="text-8xl font-bold tracking-tight select-none">
          {detected && letter !== "?" ? letter : "–"}
        </div>
        <div className="mt-2 text-sm font-medium opacity-70">
          {detected ? `${Math.round(conf * 100)}% confidence` : "No hand detected"}
        </div>
        {result?.handedness && (
          <div className="mt-1 text-xs opacity-50">{result.handedness} hand</div>
        )}
      </div>

      {/* Sentence builder */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sentence Builder
          </span>
          <button
            onClick={() => { setSentence(""); setLastAdded(null); }}
            className="text-xs text-slate-600 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        </div>
        <p className="text-lg font-mono min-h-[2rem] text-slate-200 break-all">
          {sentence || <span className="text-slate-600">Hold a letter for 1.5 s to type it…</span>}
        </p>
      </div>

      {/* History trail */}
      {result?.history?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {result.history.map((l, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 font-mono"
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
