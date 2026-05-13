import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const DIFFICULTY_COLOR = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  hard: "text-red-400 bg-red-400/10",
};

// SVG hand silhouettes (simple letter labels — extend with real images)
function HandIllustration({ letter }) {
  return (
    <div className="flex items-center justify-center w-48 h-48 rounded-2xl bg-slate-800 border border-slate-700 text-7xl font-bold text-sky-400 select-none">
      {letter}
    </div>
  );
}

export default function LearnMode() {
  const [signs, setSigns] = useState({});
  const [letters, setLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/signs")
      .then((r) => r.json())
      .then(({ signs: s }) => {
        setSigns(s);
        setLetters(Object.keys(s).sort());
      })
      .catch(() => {});
  }, []);

  const filtered = filter === "all"
    ? letters
    : letters.filter((l) => signs[l]?.difficulty === filter);

  const letter = filtered[idx] ?? "";
  const sign = signs[letter] ?? {};

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(filtered.length - 1, i + 1));

  useEffect(() => setIdx(0), [filter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "easy", "medium", "hard"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-sky-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Letter grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {filtered.map((l, i) => (
          <button
            key={l}
            onClick={() => setIdx(i)}
            className={`aspect-square rounded-lg text-lg font-bold transition-all ${
              i === idx
                ? "bg-sky-500 text-white glow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Sign card */}
      {letter && (
        <div className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <HandIllustration letter={letter} />

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-4xl font-bold text-white">{letter}</h2>
                <span
                  className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                    DIFFICULTY_COLOR[sign.difficulty] ?? ""
                  }`}
                >
                  {sign.difficulty}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  disabled={idx === 0}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  disabled={idx === filtered.length - 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">{sign.description}</p>

            <div className="mt-auto flex items-center gap-2 text-slate-500 text-sm">
              <Star size={14} />
              <span>
                {idx + 1} of {filtered.length} signs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
