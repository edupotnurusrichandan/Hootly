// Web Audio API procedural ambient sound generator (100% offline, zero copyright)
let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioNode | null = null;
let gainNode: GainNode | null = null;
let currentType: 'none' | 'rain' | 'cafe' | 'whitenoise' = 'none';

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

// Generate pink/white/brown noise buffer
function createNoiseBuffer(ctx: AudioContext, seconds = 4, type: 'white' | 'pink' | 'brown' = 'white'): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    // Brown noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
  }

  return buffer;
}

export function playAmbientSound(type: 'none' | 'rain' | 'cafe' | 'whitenoise', volume = 0.5) {
  stopAmbientSound();
  if (type === 'none') {
    currentType = 'none';
    return;
  }

  try {
    const ctx = getAudioContext();
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (type === 'rain') {
      // Pink noise + gentle low-pass filter (around 800Hz)
      const noiseBuffer = createNoiseBuffer(ctx, 5, 'pink');
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);

      source.connect(filter);
      filter.connect(gainNode);
      source.start();
      currentSourceNode = source;
    } else if (type === 'cafe') {
      // Warm brown noise + resonance simulating muffled ambience
      const noiseBuffer = createNoiseBuffer(ctx, 6, 'brown');
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      source.connect(filter);
      filter.connect(gainNode);
      source.start();
      currentSourceNode = source;
    } else if (type === 'whitenoise') {
      // Calming soft white noise
      const noiseBuffer = createNoiseBuffer(ctx, 4, 'white');
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);

      source.connect(filter);
      filter.connect(gainNode);
      source.start();
      currentSourceNode = source;
    }

    currentType = type;
  } catch (err) {
    console.error('Failed to start ambient audio:', err);
  }
}

export function setAmbientVolume(volume: number) {
  if (gainNode && audioCtx) {
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
}

export function stopAmbientSound() {
  if (currentSourceNode) {
    try {
      (currentSourceNode as AudioBufferSourceNode).stop();
      currentSourceNode.disconnect();
    } catch {
      // ignore
    }
    currentSourceNode = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  currentType = 'none';
}

export function getCurrentAmbientType(): 'none' | 'rain' | 'cafe' | 'whitenoise' {
  return currentType;
}
