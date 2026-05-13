import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const DIFFICULTY_COLOR = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  hard: "text-red-400 bg-red-400/10",
};

// All sign data built into the app — no server needed
const ASL_SIGNS = {
  A: { description: "Make a fist. Thumb rests on the side of the index finger.", difficulty: "easy" },
  B: { description: "Hold four fingers together and straight up. Tuck thumb across palm.", difficulty: "easy" },
  C: { description: "Curve all fingers and thumb to form the letter C.", difficulty: "easy" },
  D: { description: "Curl middle, ring, and pinky. Touch thumb to middle fingertip. Point index up.", difficulty: "medium" },
  E: { description: "Bend all fingers down. Tuck thumb under fingers.", difficulty: "medium" },
  F: { description: "Touch thumb and index fingertips together. Hold other three fingers up.", difficulty: "medium" },
  G: { description: "Point index finger sideways. Thumb points the same direction.", difficulty: "medium" },
  H: { description: "Point index and middle fingers sideways together.", difficulty: "medium" },
  I: { description: "Hold up only the pinky finger. Make a fist with other fingers.", difficulty: "easy" },
  J: { description: "Start with I handshape, then trace a J arc in the air.", difficulty: "medium" },
  K: { description: "Extend index and middle fingers in a V. Place thumb between them.", difficulty: "hard" },
  L: { description: "Extend index finger up and thumb out to form an L shape.", difficulty: "easy" },
  M: { description: "Tuck thumb under three fingers (index, middle, ring).", difficulty: "hard" },
  N: { description: "Tuck thumb under two fingers (index and middle).", difficulty: "hard" },
  O: { description: "Curve all fingers and thumb to touch — forming an O.", difficulty: "easy" },
  P: { description: "Like K but point fingers downward.", difficulty: "hard" },
  Q: { description: "Like G but point fingers downward.", difficulty: "hard" },
  R: { description: "Cross index and middle fingers. Extend them upward.", difficulty: "medium" },
  S: { description: "Make a fist. Thumb wraps over the front of the fingers.", difficulty: "easy" },
  T: { description: "Tuck thumb between index and middle fingers.", difficulty: "medium" },
  U: { description: "Hold index and middle fingers up together. Tuck other fingers.", difficulty: "easy" },
  V: { description: "Extend index and middle fingers in a V shape.", difficulty: "easy" },
  W: { description: "Extend index, middle, and ring fingers spread apart.", difficulty: "medium" },
  X: { description: "Hook the index finger like a crooked finger.", difficulty: "medium" },
  Y: { description: "Extend thumb out and pinky up. Curl other fingers.", difficulty: "easy" },
  Z: { description: "Draw a Z in the air with your index finger.", difficulty: "medium" },
};

function HandIllustration({ letter }) {
  return (
    <div className="flex items-center justify-center w-48 h-48 rounded-2xl bg-slate-800 border border-slate-700 text-7xl font-bold text-sky-400 select-none flex-shrink-0">
      {letter}
    </div>
  );
}

export default function LearnMode() {
  const letters = Object.keys(ASL_SIGNS).sort();
  const [idx, setIdx] = useState(0);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? letters
    : letters.filter((l) => ASL_SIGNS[l]?.difficulty === filter);

  const letter = filtered[idx] ?? "";
  const sign = ASL_SIGNS[letter] ?? {};

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
                ? "bg-sky-500 text-white"
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
                <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${DIFFICULTY_COLOR[sign.difficulty] ?? ""}`}>
                  {sign.difficulty}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={prev} disabled={idx === 0}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={next} disabled={idx === filtered.length - 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">{sign.description}</p>

            <div className="mt-auto flex items-center gap-2 text-slate-500 text-sm">
              <Star size={14} />
              <span>{idx + 1} of {filtered.length} signs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
