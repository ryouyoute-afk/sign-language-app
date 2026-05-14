import { useState, useEffect, useCallback } from "react";
import { Trophy, RefreshCw, Share2, Check, X } from "lucide-react";

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

const ALL_LETTERS = Object.keys(LETTER_IMAGES);
const APP_URL = "https://sign-language-app-olive.vercel.app";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getChoices(correct) {
  const wrong = shuffle(ALL_LETTERS.filter((l) => l !== correct)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

function makeQuestion() {
  const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  return { letter, choices: getChoices(letter) };
}

function ShareButton({ score, total }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const text = `🤙 I scored ${score}/${total} on the SignAI ASL quiz! Can you beat me?\n${APP_URL}`;
    if (navigator.share) {
      try { await navigator.share({ title: "SignAI Quiz", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button onClick={share}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors">
      <Share2 size={15} />
      {copied ? "Copied!" : "Share Score"}
    </button>
  );
}

export default function QuizMode() {
  const TOTAL = 10;
  const [questions] = useState(() => Array.from({ length: TOTAL }, makeQuestion));
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);

  const question = questions[qIdx];

  const handleAnswer = useCallback((choice) => {
    if (selected) return;
    setSelected(choice);
    const correct = choice === question.letter;
    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, { letter: question.letter, chosen: choice, correct }]);

    setTimeout(() => {
      if (qIdx + 1 >= TOTAL) {
        setDone(true);
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 900);
  }, [selected, question, qIdx]);

  const restart = () => {
    window.location.reload();
  };

  if (done) {
    const pct = Math.round((score / TOTAL) * 100);
    const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "👍" : "💪";
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="text-6xl">{emoji}</div>
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1">Your score</p>
          <p className="text-5xl font-bold text-white">{score} <span className="text-slate-500 text-2xl">/ {TOTAL}</span></p>
          <p className="text-slate-400 mt-1">{pct}% correct</p>
        </div>

        {/* Result breakdown */}
        <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
          {results.map((r, i) => (
            <div key={i} className={`flex flex-col items-center p-2 rounded-xl text-sm font-bold ${
              r.correct ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}>
              <span>{r.correct ? <Check size={14}/> : <X size={14}/>}</span>
              <span>{r.letter}</span>
              {!r.correct && <span className="text-xs text-slate-500">→{r.chosen}</span>}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={restart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold">
            <RefreshCw size={15} /> Try Again
          </button>
          <ShareButton score={score} total={TOTAL} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Question {qIdx + 1} of {TOTAL}</span>
        <div className="flex items-center gap-2 text-sm">
          <Trophy size={14} className="text-yellow-400" />
          <span className="text-slate-200 font-semibold">{score} pts</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div className="h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${((qIdx) / TOTAL) * 100}%` }} />
      </div>

      {/* Question */}
      <p className="text-slate-400 text-sm text-center">What letter is this hand sign?</p>
      <div className="flex justify-center">
        <div className="w-56 h-56 rounded-2xl bg-white overflow-hidden border-2 border-slate-700">
          <img
            src={LETTER_IMAGES[question.letter]}
            alt="ASL hand sign"
            className="w-full h-full object-contain p-2"
          />
        </div>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => {
          let style = "bg-slate-800 hover:bg-slate-700 text-white";
          if (selected) {
            if (choice === question.letter) style = "bg-green-500 text-white";
            else if (choice === selected) style = "bg-red-500 text-white";
            else style = "bg-slate-800 text-slate-500";
          }
          return (
            <button key={choice} onClick={() => handleAnswer(choice)}
              className={`py-4 rounded-2xl text-3xl font-bold transition-all ${style}`}>
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
