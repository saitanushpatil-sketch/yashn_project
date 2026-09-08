import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';

/**
 * AudioEngine — Redesigned for pure emotional storytelling.
 * 
 * 1. LANDING: Cinematic, slow-evolving. Felt piano, warm strings, air choir, tiny bells.
 * 2. INTRO: Swells to an emotional peak, then fades completely.
 * 3. CHAT: Complete silence.
 */
const AudioEngine = forwardRef((props, ref) => {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const nodesRef = useRef([]);
  const timersRef = useRef([]);
  const playingRef = useRef(false);
  const modeRef = useRef(null); // 'landing' | 'intro' | 'chat'

  useEffect(() => {
    return () => cleanup();
  }, []);

  const init = () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!masterRef.current || masterRef.current.context !== ctxRef.current) {
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = 0;
      masterRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
  };

  const cleanup = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    nodesRef.current.forEach(n => {
      try { n.stop?.(); } catch {}
      try { n.disconnect?.(); } catch {}
    });
    nodesRef.current = [];
  };

  const playTone = (freq, type, volume, attack, sustain, release, delay = 0) => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 6; // Slight organic drift

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.setValueAtTime(volume, now + attack + sustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + sustain + release);

    osc.connect(gain);
    gain.connect(masterRef.current);
    osc.start(now);
    osc.stop(now + attack + sustain + release + 0.1);
    nodesRef.current.push(osc, gain);
  };

  // ── LANDING THEME ──
  // Felt piano, warm violin, air choir, distant bells. Like watching rain.
  const startLanding = () => {
    // D Major Pentatonic
    const pianoNotes = [293.66, 329.63, 369.99, 440, 493.88]; // D4, E4, F#4, A4, B4
    const stringNotes = [146.83, 220, 184.99]; // D3, A3, F#3

    // Very slow, evolving strings (Cello/Violin feel)
    const playStrings = () => {
      if (!playingRef.current || modeRef.current !== 'landing') return;
      const note = stringNotes[Math.floor(Math.random() * stringNotes.length)];
      playTone(note, 'sine', 0.02, 6, 8, 10); // Very slow attack and release
      
      const next = 15000 + Math.random() * 10000;
      timersRef.current.push(setTimeout(playStrings, next));
    };

    // Felt piano (Triangle wave with soft envelope)
    const playPiano = () => {
      if (!playingRef.current || modeRef.current !== 'landing') return;
      const note = pianoNotes[Math.floor(Math.random() * pianoNotes.length)];
      playTone(note, 'triangle', 0.03, 0.5, 1, 6);
      
      // Sometimes play a double note
      if (Math.random() > 0.6) {
        const harmony = pianoNotes[Math.floor(Math.random() * pianoNotes.length)];
        playTone(harmony, 'triangle', 0.02, 0.6, 1, 5, 0.4);
      }

      const next = 6000 + Math.random() * 8000;
      timersRef.current.push(setTimeout(playPiano, next));
    };

    // Tiny bells occasionally
    const playBells = () => {
      if (!playingRef.current || modeRef.current !== 'landing') return;
      if (Math.random() > 0.4) {
        const bellNote = [1174.66, 1479.98][Math.floor(Math.random() * 2)]; // D6, F#6
        playTone(bellNote, 'sine', 0.01, 0.1, 0.2, 8);
      }
      const next = 12000 + Math.random() * 15000;
      timersRef.current.push(setTimeout(playBells, next));
    };

    // Choir pad drone (D4 + A4)
    playTone(293.66, 'sine', 0.015, 8, 999, 5); 
    playTone(440, 'sine', 0.01, 10, 999, 5);

    timersRef.current.push(setTimeout(playStrings, 1000));
    timersRef.current.push(setTimeout(playPiano, 4000));
    timersRef.current.push(setTimeout(playBells, 15000));
  };

  // ── INTRO THEME ──
  // Builds to an emotional peak
  const startIntro = () => {
    // Deep cello foundation
    playTone(73.42, 'sine', 0.03, 5, 8, 6); // D2
    playTone(146.83, 'sine', 0.02, 6, 8, 6); // D3

    // Swelling strings
    playTone(369.99, 'sine', 0.02, 8, 5, 5); // F#4
    playTone(440, 'sine', 0.02, 9, 4, 5);    // A4
    playTone(587.33, 'sine', 0.015, 10, 3, 5); // D5 (Peak)

    // Piano melody building up
    playTone(293.66, 'triangle', 0.04, 0.3, 0.5, 4, 2);
    playTone(329.63, 'triangle', 0.04, 0.3, 0.5, 4, 4);
    playTone(440, 'triangle', 0.04, 0.3, 0.5, 4, 6);
    playTone(587.33, 'triangle', 0.05, 0.3, 0.5, 5, 9.5); // "Yashñ" appears

    // Bells at the peak
    playTone(1174.66, 'sine', 0.02, 0.1, 0.2, 6, 9.5);
    playTone(1479.98, 'sine', 0.015, 0.1, 0.2, 6, 12); // "I remember."
  };

  // ── Public API ──
  const startAmbience = (mode = 'landing') => {
    // If chat, absolute silence
    if (mode === 'chat') {
      stopAmbience();
      return;
    }

    init();
    cleanup();
    modeRef.current = mode;
    playingRef.current = true;

    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    masterRef.current.gain.setValueAtTime(0, now);
    masterRef.current.gain.linearRampToValueAtTime(1, now + 4);

    if (mode === 'landing') startLanding();
    else if (mode === 'intro') startIntro();
  };

  const stopAmbience = () => {
    if (!ctxRef.current || !masterRef.current) {
      playingRef.current = false;
      return;
    }
    const now = ctxRef.current.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, now);
    masterRef.current.gain.linearRampToValueAtTime(0, now + 4);

    setTimeout(() => cleanup(), 4500);
    playingRef.current = false;
  };

  const transitionTo = (mode) => {
    if (mode === 'chat') {
      stopAmbience();
      return;
    }

    if (!ctxRef.current || !masterRef.current) {
      startAmbience(mode);
      return;
    }
    
    const now = ctxRef.current.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, now);
    masterRef.current.gain.linearRampToValueAtTime(0, now + 2);

    setTimeout(() => {
      cleanup();
      startAmbience(mode);
    }, 2200);
  };

  const setVolume = (val) => {
    if (!masterRef.current || !ctxRef.current) return;
    const now = ctxRef.current.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    masterRef.current.gain.linearRampToValueAtTime(val, now + 0.5);
  };

  // ── UI Sounds ──
  const playClick = () => {
    init();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.06);
    g.gain.setValueAtTime(0.04, now); // Softer
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  };

  const playMessage = () => {
    init();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(587.33, now + 0.12);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.02, now + 0.04); // Very soft
    g.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  };

  useImperativeHandle(ref, () => ({
    startAmbience,
    stopAmbience,
    transitionTo,
    setVolume,
    playClick,
    playMessage,
  }));

  return null;
});

export default AudioEngine;
