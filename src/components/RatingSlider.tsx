import type { CSSProperties } from 'react';

const SCORE_LABELS: Record<number, string> = {
  1: 'Needs work',
  2: 'Below avg',
  3: 'Solid',
  4: 'Great',
  5: 'Stellar ✨',
};

interface RatingSliderProps {
  label: string;
  icon: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  accent: string;
}

export function RatingSlider({
  label,
  icon,
  hint,
  value,
  onChange,
  accent,
}: RatingSliderProps) {
  return (
    <div
      className={`rounded-2xl border border-violet-500/25 bg-[#12102a]/80 p-4 transition-all hover:border-violet-400/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-lg shadow-[0_0_12px_rgba(168,85,247,0.3)]`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[#f5f3ff] text-sm">{label}</p>
            {hint && <p className="text-xs text-violet-400/80 truncate">{hint}</p>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold font-display text-[#f5f3ff] tabular-nums">
            {value}
          </span>
          <span className="text-violet-400/70 text-sm">/5</span>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="candy-range w-full"
        style={
          {
            '--range-pct': `${((value - 1) / 4) * 100}%`,
          } as CSSProperties
        }
      />

      <div className="flex justify-between mt-2 gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 rounded-lg py-1 text-xs font-medium transition-all ${
              value === n
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#e879f9] text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-violet-400/60 hover:text-violet-200 hover:bg-violet-500/10'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-fuchsia-300/90 mt-2 font-medium">
        {SCORE_LABELS[value]}
      </p>
    </div>
  );
}

export function ScoreRing({ score, max = 5 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (pct / 100) * circumference;

  let grade = 'Growing';
  let gradeColor = 'text-amber-300';
  if (score >= 4.5) {
    grade = 'Top Star';
    gradeColor = 'text-fuchsia-300';
  } else if (score >= 3.5) {
    grade = 'Sweet Spot';
    gradeColor = 'text-violet-300';
  } else if (score < 2.5) {
    grade = 'Needs Boost';
    gradeColor = 'text-pink-300';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-display text-[#f5f3ff] tabular-nums">
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-violet-400">/ {max}</span>
        </div>
      </div>
      <p className={`mt-2 text-sm font-semibold ${gradeColor}`}>{grade}</p>
    </div>
  );
}
