import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const DIFFICULTY_COLOR = {
  easy:   "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  hard:   "text-red-400 bg-red-400/10",
};

const ASL_LETTERS = {
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

const ASL_NUMBERS = {
  0: { description: "Curve all fingers and thumb together to form an O shape.", difficulty: "easy" },
  1: { description: "Point index finger straight up. Curl all other fingers into a fist.", difficulty: "easy" },
  2: { description: "Hold index and middle fingers up in a V shape. Thumb out to the side.", difficulty: "easy" },
  3: { description: "Extend thumb, index, and middle fingers. Curl ring and pinky down.", difficulty: "easy" },
  4: { description: "Hold four fingers straight up, spread apart. Tuck thumb across palm.", difficulty: "easy" },
  5: { description: "Spread all five fingers wide open.", difficulty: "easy" },
  6: { description: "Touch pinky and thumb together. Hold index, middle, and ring fingers up.", difficulty: "medium" },
  7: { description: "Touch ring finger and thumb together. Hold other fingers up.", difficulty: "medium" },
  8: { description: "Touch middle finger and thumb together. Hold other fingers up.", difficulty: "medium" },
  9: { description: "Touch index finger and thumb together in a circle. Curl other fingers.", difficulty: "medium" },
};

// Image URLs from lifeprint.com (free ASL educational resource)
function getImageUrl(key, type) {
  if (type === "letter") {
    return `https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/${key.toLowerCase()}.gif`;
  }
  return `https://www.lifeprint.com/asl101/fingerspelling/numbers/${key}.gif`;
}

function SignImage({ label, src }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex items-center justify-center w-48 h-48 rounded-2xl bg-slate-800 border border-slate-700 flex-shrink-0 overflow-hidden">
      {!failed ? (
        <img
          src={src}
          alt={`ASL sign for ${label}`}
          className="w-full h-full object-contain p-2"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-7xl font-bold text-sky-400 select-none">{label}</span>
      )}
    </div>
  );
}

function SignGrid({ items, idx, onSelect }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {items.map((key, i) => (
        <button
          key={key}
          onClick={() => onSelect(i)}
          className={`aspect-square rounded-lg text-lg font-bold transition-all ${
            i === idx
              ? "bg-sky-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

function SignCard({ label, sign, imageUrl, idx, total, onPrev, onNext }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <SignImage label={label} src={imageUrl} />
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white">{label}</h2>
            <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${DIFFICULTY_COLOR[sign.difficulty] ?? ""}`}>
              {sign.difficulty}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={onPrev} disabled={idx === 0}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={onNext} disabled={idx === total - 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed">{sign.description}</p>
        <div className="mt-auto flex items-center gap-2 text-slate-500 text-sm">
          <Star size={14} />
          <span>{idx + 1} of {total}</span>
        </div>
      </div>
    </div>
  );
}

export default function LearnMode() {
  const [tab, setTab] = useState("letters");
  const [filter, setFilter] = useState("all");
  const [idx, setIdx] = useState(0);

  const isLetters = tab === "letters";
  const allKeys = isLetters
    ? Object.keys(ASL_LETTERS).sort()
    : Object.keys(ASL_NUMBERS).map(Number).sort((a, b) => a - b).map(String);

  const filtered = isLetters && filter !== "all"
    ? allKeys.filter((k) => ASL_LETTERS[k]?.difficulty === filter)
    : allKeys;

  const key = filtered[idx];
  const sign = isLetters ? ASL_LETTERS[key] : ASL_NUMBERS[key];
  const imageUrl = key !== undefined ? getImageUrl(key, isLetters ? "letter" : "number") : "";

  useEffect(() => setIdx(0), [tab, filter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Letters / Numbers tabs */}
      <div className="flex gap-2">
        {["letters", "numbers"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
              tab === t ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Difficulty filter (letters only) */}
      {isLetters && (
        <div className="flex gap-2">
          {["all", "easy", "medium", "hard"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}>
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <SignGrid items={filtered} idx={idx} onSelect={setIdx} />

      {/* Card */}
      {key !== undefined && sign && (
        <SignCard
          label={key}
          sign={sign}
          imageUrl={imageUrl}
          idx={idx}
          total={filtered.length}
          onPrev={() => setIdx((i) => Math.max(0, i - 1))}
          onNext={() => setIdx((i) => Math.min(filtered.length - 1, i + 1))}
        />
      )}
    </div>
  );
}
