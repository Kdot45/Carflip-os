"use client";

import clsx from "@/lib/clsx";

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Eight tick marks at 45° increments, computed from the gauge center (60,60).
const TICKS = [
  { x1: 60, y1: 5, x2: 60, y2: 1 },
  { x1: 98.9, y1: 21.1, x2: 101.7, y2: 18.3 },
  { x1: 115, y1: 60, x2: 119, y2: 60 },
  { x1: 98.9, y1: 98.9, x2: 101.7, y2: 101.7 },
  { x1: 60, y1: 115, x2: 60, y2: 119 },
  { x1: 21.1, y1: 98.9, x2: 18.3, y2: 101.7 },
  { x1: 5, y1: 60, x2: 1, y2: 60 },
  { x1: 21.1, y1: 21.1, x2: 18.3, y2: 18.3 },
];

/** A tach-style radial gauge. `fillPct` (0-100) is how full the ring reads,
 * `valueLabel`/`caption` are the text shown in the center. */
export function Gauge({
  fillPct,
  valueLabel,
  caption,
  tone = "teal",
  size = 96,
}: {
  fillPct: number;
  valueLabel: string;
  caption: string;
  tone?: "teal" | "amber" | "bad";
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, fillPct));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const toneClasses = {
    teal: { stroke: "stroke-teal-500", text: "text-good", glow: "drop-shadow-[0_0_6px_rgba(53,208,192,0.55)]" },
    amber: { stroke: "stroke-accent-500", text: "text-accent-500", glow: "drop-shadow-[0_0_6px_rgba(255,139,61,0.55)]" },
    bad: { stroke: "stroke-bad", text: "text-bad", glow: "drop-shadow-[0_0_6px_rgba(255,92,92,0.55)]" },
  }[tone];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <g className="stroke-ink-500">
          {TICKS.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={1.3} />
          ))}
        </g>
        <g style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}>
          <circle cx="60" cy="60" r={RADIUS} className="fill-none stroke-ink-500" strokeWidth={9} />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            className={clsx("fill-none motion-safe:animate-sweep", toneClasses.stroke, toneClasses.glow)}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ ["--sweep-from" as string]: CIRCUMFERENCE, ["--sweep-to" as string]: offset }}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={clsx("font-mono text-xl font-extrabold leading-none", toneClasses.text)}>{valueLabel}</span>
        <span className="mt-1 text-center text-[10px] uppercase tracking-wide text-ink-300">{caption}</span>
      </div>
    </div>
  );
}
