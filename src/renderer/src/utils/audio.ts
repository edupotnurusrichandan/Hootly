// Soft synthesized hoot & Opera-style startup audio using Web Audio API (Zero external assets, 100% offline)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSoftHoot(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First hoot (lower, gentle)
    createTone(ctx, 440, now, 0.18, 0.12);

    // Second hoot (slightly higher, melodic "hoo-HOOT")
    createTone(ctx, 520, now + 0.16, 0.26, 0.15);
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err);
  }
}

/**
 * Opera / Opera-GX style startup sound effect:
 * An ethereal swelling cinematic chord that ascends and resolves with a bright, welcoming chime!
 */
export function playOperaIntroSwell(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Chord frequencies: C4 (261.63), G4 (392.00), C5 (523.25), E5 (659.25), B5 (987.77)
    const notes = [261.63, 392.00, 523.25, 659.25, 987.77];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.9);

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq * 0.92, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.5);

      const delay = index * 0.08;
      const startTime = now + delay;
      const duration = 1.4;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // Subtle welcoming owl chime at the swell apex
    setTimeout(() => {
      playSoftHoot();
    }, 700);
  } catch (err) {
    console.warn('Audio intro playback failed:', err);
  }
}

function createTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, peakGain: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, startTime);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, startTime);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.9, startTime + duration);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}
