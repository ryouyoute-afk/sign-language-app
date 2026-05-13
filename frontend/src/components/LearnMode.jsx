import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const DIFFICULTY_COLOR = {
  easy:   "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  hard:   "text-red-400 bg-red-400/10",
};

const ASL_LETTERS = {
  A: { description: "Make a fist. Thumb rests on the side of the index finger.", difficulty: "easy" },
  B: { description: "Hold all four fingers straight up and together. Tuck your thumb flat across the palm.", difficulty: "easy" },
  C: { description: "Curve all fingers and thumb into a C shape, like holding a cup.", difficulty: "easy" },
  D: { description: "Touch your thumb to your middle, ring, and pinky fingers. Point your index finger straight up.", difficulty: "medium" },
  E: { description: "Curl all four fingers down so the tips touch the top of the palm. Tuck thumb under.", difficulty: "medium" },
  F: { description: "Touch the tip of your index finger to the tip of your thumb. Hold middle, ring, and pinky fingers up.", difficulty: "medium" },
  G: { description: "Point your index finger sideways (to the side). Thumb also points the same direction.", difficulty: "medium" },
  H: { description: "Point your index and middle fingers sideways together, side by side.", difficulty: "medium" },
  I: { description: "Make a fist and extend only your pinky finger straight up.", difficulty: "easy" },
  J: { description: "Hold up your pinky (like I), then draw a J shape in the air moving down and curving.", difficulty: "medium" },
  K: { description: "Point index finger up, middle finger angled out, thumb between them. Like a K shape.", difficulty: "hard" },
  L: { description: "Extend your index finger up and your thumb out to the side — making an L shape.", difficulty: "easy" },
  M: { description: "Fold your index, middle, and ring fingers over your thumb. Pinky tucked.", difficulty: "hard" },
  N: { description: "Fold your index and middle fingers over your thumb. Ring and pinky tucked.", difficulty: "hard" },
  O: { description: "Bring all your fingertips together to touch your thumb tip, forming an O circle.", difficulty: "easy" },
  P: { description: "Like K but rotate your hand so fingers point downward instead of up.", difficulty: "hard" },
  Q: { description: "Like G (index and thumb pointing) but rotate hand so fingers point downward.", difficulty: "hard" },
  R: { description: "Cross your index and middle fingers over each other and extend them upward.", difficulty: "medium" },
  S: { description: "Make a fist with your thumb wrapped over the front of all four fingers.", difficulty: "easy" },
  T: { description: "Make a fist with your thumb poking out between your index and middle fingers.", difficulty: "medium" },
  U: { description: "Hold your index and middle fingers straight up together, side by side. Curl others.", difficulty: "easy" },
  V: { description: "Extend your index and middle fingers up and spread them apart in a V shape.", difficulty: "easy" },
  W: { description: "Hold your index, middle, and ring fingers up and spread apart. Thumb and pinky folded.", difficulty: "medium" },
  X: { description: "Extend your index finger and bend/hook it like a curved hook or question mark.", difficulty: "medium" },
  Y: { description: "Extend your thumb out to the side and your pinky finger up. Curl the other three fingers.", difficulty: "easy" },
  Z: { description: "Point your index finger and draw the letter Z in the air.", difficulty: "medium" },
};

const ASL_NUMBERS = {
  0: { description: "Bring all your fingertips together to touch your thumb — making a round O shape.", difficulty: "easy" },
  1: { description: "Point your index finger straight up. Curl all other fingers into a fist.", difficulty: "easy" },
  2: { description: "Hold your index and middle fingers up in a V shape. Thumb rests to the side.", difficulty: "easy" },
  3: { description: "Extend your thumb, index finger, and middle finger. Curl your ring and pinky fingers down.", difficulty: "easy" },
  4: { description: "Hold all four fingers straight up and spread apart. Tuck your thumb across your palm.", difficulty: "easy" },
  5: { description: "Spread all five fingers wide open — like a full open hand.", difficulty: "easy" },
  6: { description: "Touch your pinky fingertip to your thumb tip. Hold your other three fingers up.", difficulty: "medium" },
  7: { description: "Touch your ring fingertip to your thumb tip. Hold your other fingers up.", difficulty: "medium" },
  8: { description: "Touch your middle fingertip to your thumb tip. Hold your other fingers up.", difficulty: "medium" },
  9: { description: "Touch your index fingertip to your thumb tip making a circle. Curl your other fingers.", difficulty: "medium" },
};

// Wikimedia Commons has reliable, freely-licensed ASL letter images
const LETTER_IMAGES = {
  A: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Sign_language_A.svg/200px-Sign_language_A.svg.png",
  B: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Sign_language_B.svg/200px-Sign_language_B.svg.png",
  C: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sign_language_C.svg/200px-Sign_language_C.svg.png",
  D: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sign_language_D.svg/200px-Sign_language_D.svg.png",
  E: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Sign_language_E.svg/200px-Sign_language_E.svg.png",
  F: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Sign_language_F.svg/200px-Sign_language_F.svg.png",
  G: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Sign_language_G.svg/200px-Sign_language_G.svg.png",
  H: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Sign_language_H.svg/200px-Sign_language_H.svg.png",
  I: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sign_language_I.svg/200px-Sign_language_I.svg.png",
  J: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sign_language_J.svg/200px-Sign_language_J.svg.png",
  K: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Sign_language_K.svg/200px-Sign_language_K.svg.png",
  L: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sign_language_L.svg/200px-Sign_language_L.svg.png",
  M: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Sign_language_M.svg/200px-Sign_language_M.svg.png",
  N: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Sign_language_N.svg/200px-Sign_language_N.svg.png",
  O: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sign_language_O.svg/200px-Sign_language_O.svg.png",
  P: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Sign_language_P.svg/200px-Sign_language_P.svg.png",
  Q: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Sign_language_Q.svg/200px-Sign_language_Q.svg.png",
  R: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Sign_language_R.svg/200px-Sign_language_R.svg.png",
  S: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Sign_language_S.svg/200px-Sign_language_S.svg.png",
  T: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Sign_language_T.svg/200px-Sign_language_T.svg.png",
  U: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Sign_language_U.svg/200px-Sign_language_U.svg.png",
  V: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Sign_language_V.svg/200px-Sign_language_V.svg.png",
  W: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Sign_language_W.svg/200px-Sign_language_W.svg.png",
  X: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sign_language_X.svg/200px-Sign_language_X.svg.png",
  Y: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Sign_language_Y.svg/200px-Sign_language_Y.svg.png",
  Z: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sign_language_Z.svg/200px-Sign_language_Z.svg.png",
};

function SignImage({ label, src }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex items-center justify-center w-48 h-48 rounded-2xl bg-white border border-slate-200 flex-shrink-0 overflow-hidden">
      {src && !failed ? (
        <img
          src={src}
          alt={`ASL sign for ${label}`}
          className="w-full h-full object-contain p-3"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-7xl font-bold text-sky-500 select-none">{label}</span>
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
    : ["0","1","2","3","4","5","6","7","8","9"];

  const filtered = isLetters && filter !== "all"
    ? allKeys.filter((k) => ASL_LETTERS[k]?.difficulty === filter)
    : allKeys;

  const key = filtered[idx];
  const sign = isLetters ? ASL_LETTERS[key] : ASL_NUMBERS[key];
  const imageUrl = isLetters ? LETTER_IMAGES[key] : null;

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
        <div className="flex gap-2 flex-wrap">
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
