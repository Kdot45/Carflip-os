/**
 * Procedurally synthesized sound effects via the Web Audio API — no audio
 * files, so nothing to license. Deliberately short, one-shot, and only ever
 * triggered by a direct user action (never autoplay), which also satisfies
 * browser autoplay policies since it always runs inside a user gesture's
 * call stack (e.g. a login button's onClick).
 */

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext) sharedContext = new AudioContextClass();
  if (sharedContext.state === "suspended") void sharedContext.resume();
  return sharedContext;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * A stylized engine crank-and-catch: a short burst of filtered noise (the
 * starter motor) followed by a low sawtooth sweep that revs up and settles
 * to an idle burble. Roughly 1.1s total.
 */
export function playEngineStart() {
  const ctx = getContext();
  if (!ctx || prefersReducedMotion()) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);

  // --- Starter crank: short filtered noise burst, three quick chugs ---
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 220;
  noiseFilter.Q.value = 1.2;

  [0, 0.09, 0.18].forEach((offset) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.9, now + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
    source.connect(noiseFilter);
    noiseFilter.connect(gain);
    gain.connect(master);
    source.start(now + offset);
    source.stop(now + offset + 0.09);
  });

  // --- Catch and rev: sawtooth sweeping up then settling to idle ---
  const engineStart = now + 0.28;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(45, engineStart);
  osc.frequency.exponentialRampToValueAtTime(180, engineStart + 0.22);
  osc.frequency.exponentialRampToValueAtTime(70, engineStart + 0.55);
  osc.frequency.linearRampToValueAtTime(62, engineStart + 0.85);

  const engineFilter = ctx.createBiquadFilter();
  engineFilter.type = "lowpass";
  engineFilter.frequency.value = 900;

  const engineGain = ctx.createGain();
  engineGain.gain.setValueAtTime(0, engineStart);
  engineGain.gain.linearRampToValueAtTime(0.5, engineStart + 0.05);
  engineGain.gain.linearRampToValueAtTime(0.32, engineStart + 0.3);
  engineGain.gain.setValueAtTime(0.32, engineStart + 0.65);
  engineGain.gain.exponentialRampToValueAtTime(0.001, engineStart + 0.85);

  osc.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(master);
  osc.start(engineStart);
  osc.stop(engineStart + 0.9);
}
