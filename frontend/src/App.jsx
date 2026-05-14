import { useState } from "react";
import { Hand, BookOpen, Dumbbell, Scan, BrainCircuit } from "lucide-react";
import Camera from "./components/Camera";
import SignDisplay from "./components/SignDisplay";
import LearnMode from "./components/LearnMode";
import PracticeMode from "./components/PracticeMode";
import QuizMode from "./components/QuizMode";

const TABS = [
  { id: "recognize", label: "Recognize", icon: Scan },
  { id: "learn",     label: "Learn",     icon: BookOpen },
  { id: "quiz",      label: "Quiz",      icon: BrainCircuit },
  { id: "practice",  label: "Practice",  icon: Dumbbell },
];

export default function App() {
  const [tab, setTab] = useState("recognize");
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20">
              <Hand size={20} className="text-sky-400" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">SignAI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium">
              ASL
            </span>
          </div>

          {/* Tab nav */}
          <nav className="flex gap-1 flex-wrap justify-end">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-sky-500 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === "recognize" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Camera</h2>
              <Camera onResult={setResult} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Detection</h2>
              <SignDisplay result={result} />
            </div>
          </div>
        )}

        {tab === "learn" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Learn ASL</h2>
            <p className="text-slate-400 text-sm mb-6">Browse letters, numbers, and common words.</p>
            <LearnMode />
          </div>
        )}

        {tab === "quiz" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Quiz</h2>
            <p className="text-slate-400 text-sm mb-6">Look at the hand sign and pick the correct letter. 10 questions!</p>
            <QuizMode />
          </div>
        )}

        {tab === "practice" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Practice</h2>
            <p className="text-slate-400 text-sm mb-6">Sign the target letter and hold it for 2 seconds to score a point.</p>
            <PracticeMode />
          </div>
        )}
      </main>
    </div>
  );
}
