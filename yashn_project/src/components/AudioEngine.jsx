import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

// Generative ambient audio using Web Audio API
const AudioEngine = forwardRef((props, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Low ambient volume
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);

  // Setup Web Audio Context
  useEffect(() => {
    // We defer initialization until user interaction or explicitly called
    return () => {
      stopAmbience();
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.connect(audioCtxRef.current.destination);
      gainNodeRef.current.gain.value = volume;
    }
  };

  const startAmbience = () => {
    initAudio();
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    // Create a warm pad sound using multiple sine/triangle waves with slow LFOs
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    // Clear old oscillators if any
    stopAmbience();
    
    const freqs = [110, 164.81, 220, 277.18]; // A2, E3, A3, C#4 (A major chord)
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      
      // Slow envelope
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.1 / freqs.length, now + 5 + i); // 5s fade in
      
      // Detune slightly for warmth
      osc.detune.value = (Math.random() - 0.5) * 10;
      
      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);
      
      osc.start();
      oscillatorsRef.current.push({ osc, gain: oscGain });
    });
    
    setIsPlaying(true);
  };

  const stopAmbience = () => {
    if (audioCtxRef.current && oscillatorsRef.current.length > 0) {
      const now = audioCtxRef.current.currentTime;
      oscillatorsRef.current.forEach(({ osc, gain }) => {
        gain.gain.linearRampToValueAtTime(0, now + 2); // 2s fade out
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch(e) {}
        }, 2000);
      });
      oscillatorsRef.current = [];
    }
    setIsPlaying(false);
  };

  const playClickSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playMessageSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.linearRampToValueAtTime(554.37, ctx.currentTime + 0.15); // C#5
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    toggleAmbience: () => {
      if (isPlaying) stopAmbience();
      else startAmbience();
    },
    playClick: playClickSound,
    playMessage: playMessageSound,
    setVolume: (val) => {
      setVolume(val);
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
      }
    },
    isPlaying
  }));

  return null; // This component has no UI
});

export default AudioEngine;
