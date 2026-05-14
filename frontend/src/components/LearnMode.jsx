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
  G: { description: "Point your index finger sideways. Thumb also points the same direction.", difficulty: "medium" },
  H: { description: "Point your index and middle fingers sideways together, side by side.", difficulty: "medium" },
  I: { description: "Make a fist and extend only your pinky finger straight up.", difficulty: "easy" },
  J: { description: "Hold up your pinky (like I), then draw a J shape in the air moving down and curving.", difficulty: "medium" },
  K: { description: "Point index finger up, middle finger angled out, thumb between them.", difficulty: "hard" },
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
  X: { description: "Extend your index finger and bend/hook it like a curved hook.", difficulty: "medium" },
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

const ASL_WORDS = {
  "Hello":      { description: "Open your hand flat and wave it from your forehead outward, like a salute.", difficulty: "easy" },
  "Thank You":  { description: "Touch your flat hand to your chin, then move it forward and down toward the person.", difficulty: "easy" },
  "Please":     { description: "Place your flat hand on your chest and move it in a circle.", difficulty: "easy" },
  "Sorry":      { description: "Make a fist, place it on your chest, and move it in a circle.", difficulty: "easy" },
  "Yes":        { description: "Make a fist and nod it up and down, like a head nodding yes.", difficulty: "easy" },
  "No":         { description: "Extend your index and middle fingers, then snap them closed to your thumb twice.", difficulty: "easy" },
  "I Love You": { description: "Extend your thumb, index finger, and pinky finger. Hold them up together — this is the ILY sign.", difficulty: "easy" },
  "Help":       { description: "Make a fist (thumb up) and place it on your flat other hand. Lift both hands upward together.", difficulty: "medium" },
  "Stop":       { description: "Hold one hand flat, palm up. Bring your other flat hand down sharply onto it like a karate chop.", difficulty: "easy" },
  "More":       { description: "Bring all your fingertips together on both hands, then tap the fingertips of both hands together twice.", difficulty: "medium" },
  "Good":       { description: "Touch your flat hand to your chin, then move it forward and down into your other flat open hand.", difficulty: "easy" },
  "Bad":        { description: "Touch your flat hand to your chin, then flip it downward away from you.", difficulty: "easy" },
  "Water":      { description: "Make a W shape (3 fingers up) and tap it to your chin twice.", difficulty: "medium" },
  "Eat":        { description: "Bring your fingertips together and tap them to your mouth twice, like putting food in your mouth.", difficulty: "easy" },
  "Friend":     { description: "Hook your index fingers together, first one way then the other, linking them like friendship.", difficulty: "medium" },
};

// Real hand sign photos from Wikimedia Commons (orange background series)
// 7 letters missing from photo series use clean SVG illustrations as fallback
const LETTER_IMAGES = {
  A: "https://upload.wikimedia.org/wikipedia/commons/d/d9/A%40InForward.jpg",
  B: "https://upload.wikimedia.org/wikipedia/commons/7/7d/B%40InForward.jpg",
  C: "https://upload.wikimedia.org/wikipedia/commons/8/80/C%40InForward.jpg",
  D: "https://upload.wikimedia.org/wikipedia/commons/1/1c/D%40InForward.jpg",
  E: "https://upload.wikimedia.org/wikipedia/commons/c/c5/E%40InForward.jpg",
  F: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sign_language_F.svg",
  G: "https://upload.wikimedia.org/wikipedia/commons/9/91/G%40InForward.jpg",
  H: "https://upload.wikimedia.org/wikipedia/commons/1/1b/H%40InForward.jpg",
  I: "https://upload.wikimedia.org/wikipedia/commons/e/e0/I%40InForward.jpg",
  J: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Sign_language_J.svg",
  K: "https://upload.wikimedia.org/wikipedia/commons/0/03/K%40InForward.jpg",
  L: "https://upload.wikimedia.org/wikipedia/commons/f/f4/L%40InForward.jpg",
  M: "https://upload.wikimedia.org/wikipedia/commons/3/3c/M%40InForward.jpg",
  N: "https://upload.wikimedia.org/wikipedia/commons/b/b8/N%40InForward.jpg",
  O: "https://upload.wikimedia.org/wikipedia/commons/f/f1/O%40InForward.jpg",
  P: "https://upload.wikimedia.org/wikipedia/commons/0/08/Sign_language_P.svg",
  Q: "https://upload.wikimedia.org/wikipedia/commons/3/34/Sign_language_Q.svg",
  R: "https://upload.wikimedia.org/wikipedia/commons/b/b7/R%40InForward.jpg",
  S: "https://upload.wikimedia.org/wikipedia/commons/4/46/S%40InForward.jpg",
  T: "https://upload.wikimedia.org/wikipedia/commons/1/16/T%40InForward.jpg",
  U: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Sign_language_U.svg",
  V: "https://upload.wikimedia.org/wikipedia/commons/3/34/V%40InForward.jpg",
  W: "https://upload.wikimedia.org/wikipedia/commons/8/83/Sign_language_W.svg",
  X: "https://upload.wikimedia.org/wikipedia/commons/6/6d/X%40InForward.jpg",
  Y: "https://upload.wikimedia.org/wikipedia/commons/1/11/Y%40InForward.jpg",
  Z: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Sign_language_Z.svg",
};

// Real hand-sign photos from Wikimedia Commons for numbers
const NUMBER_IMAGES = {
  0: "https://upload.wikimedia.org/wikipedia/commons/f/f1/O%40InForward.jpg",
  1: "https://upload.wikimedia.org/wikipedia/commons/3/35/1%40InForward.jpg",
  2: "https://upload.wikimedia.org/wikipedia/commons/3/34/V%40InForward.jpg",
  3: "https://upload.wikimedia.org/wikipedia/commons/6/61/3%40InForward.jpg",
  4: "https://upload.wikimedia.org/wikipedia/commons/a/ae/4%40InForward.jpg",
  5: "https://upload.wikimedia.org/wikipedia/commons/c/c7/5%40InForward.jpg",
  6: "https://upload.wikimedia.org/wikipedia/commons/4/47/6%40InForward.jpg",
  7: "https://upload.wikimedia.org/wikipedia/commons/f/fe/7%40InForward.jpg",
  8: "https://upload.wikimedia.org/wikipedia/commons/7/7a/8%40InForward.jpg",
  9: "https://upload.wikimedia.org/wikipedia/commons/d/dc/9%40InForward.jpg",
};

function SignImage({ label, src }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex items-center justify-center w-48 h-48 rounded-2xl bg-white border border-slate-200 flex-shrink-0 overflow-hidden">
      {src && !failed ? (
        <img
          src={src}
          alt={`ASL hand sign for ${label}`}
          className="w-full h-full object-contain p-2"
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

function WordsGrid({ items, idx, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map((word, i) => (
        <button key={word} onClick={() => onSelect(i)}
          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all text-left ${
            i === idx ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}>
          {word}
        </button>
      ))}
    </div>
  );
}

export default function LearnMode() {
  const [tab, setTab] = useState("letters");
  const [filter, setFilter] = useState("all");
  const [idx, setIdx] = useState(0);

  const isLetters = tab === "letters";
  const isNumbers = tab === "numbers";
  const isWords   = tab === "words";

  const allKeys = isLetters
    ? Object.keys(ASL_LETTERS).sort()
    : isNumbers
    ? ["0","1","2","3","4","5","6","7","8","9"]
    : Object.keys(ASL_WORDS);

  const filtered = isLetters && filter !== "all"
    ? allKeys.filter((k) => ASL_LETTERS[k]?.difficulty === filter)
    : allKeys;

  const key  = filtered[idx];
  const sign = isLetters ? ASL_LETTERS[key] : isNumbers ? ASL_NUMBERS[Number(key)] : ASL_WORDS[key];
  const imageUrl = isLetters ? LETTER_IMAGES[key] : isNumbers ? NUMBER_IMAGES[Number(key)] : null;

  useEffect(() => setIdx(0), [tab, filter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap">
        {["letters", "numbers", "words"].map((t) => (
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
      {isWords
        ? <WordsGrid items={filtered} idx={idx} onSelect={setIdx} />
        : <SignGrid items={filtered} idx={idx} onSelect={setIdx} />
      }

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
