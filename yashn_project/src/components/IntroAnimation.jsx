import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroAnimation.css';

/* ═══════════════════════════════════════════════════════════════
   Canvas particle system — ethereal golden dust forming & dissolving
   ═══════════════════════════════════════════════════════════════ */
function useParticleCanvas(canvasRef, phase) {
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate particles
    const count = 200;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    particlesRef.current = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 250;
      return {
        // Scattered start position (offscreen / far)
        sx: cx + (Math.random() - 0.5) * window.innerWidth * 1.8,
        sy: cy + (Math.random() - 0.5) * window.innerHeight * 1.8,
        // Target orbit position around center
        tx: cx + Math.cos(angle) * dist,
        ty: cy + Math.sin(angle) * dist,
        // Orbit params
        angle,
        radius: dist,
        orbitSpeed: (0.0003 + Math.random() * 0.001) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.5 + Math.random() * 2,
        alpha: 0,
        maxAlpha: 0.15 + Math.random() * 0.55,
        delay: Math.random() * 3000,
        isGold: Math.random() < 0.7,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
      };
    });

    let startTime = Date.now();
    let currentPhase = 0;

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;

      for (const p of particlesRef.current) {
        if (elapsed < p.delay) continue;
        const localElapsed = elapsed - p.delay;

        // Phase-based behavior
        let x, y, targetAlpha;

        if (currentPhase < 2) {
          // Phase 0-1: Particles converge from scattered positions to orbit
          const convergeProg = Math.min(localElapsed / 4000, 1);
          const ease = 1 - Math.pow(1 - convergeProg, 3); // easeOutCubic
          x = p.sx + (p.tx - p.sx) * ease;
          y = p.sy + (p.ty - p.sy) * ease;
          targetAlpha = p.maxAlpha * ease * 0.6;
        } else if (currentPhase < 5) {
          // Phase 2-4: Orbit around center
          p.angle += p.orbitSpeed;
          x = centerX + Math.cos(p.angle) * p.radius;
          y = centerY + Math.sin(p.angle) * p.radius;
          p.twinklePhase += p.twinkleSpeed;
          targetAlpha = p.maxAlpha * (0.5 + 0.5 * Math.sin(p.twinklePhase));
        } else {
          // Phase 5+: Disperse outward
          p.angle += p.orbitSpeed * 0.5;
          p.radius += 1.5;
          x = centerX + Math.cos(p.angle) * p.radius;
          y = centerY + Math.sin(p.angle) * p.radius;
          targetAlpha = Math.max(0, p.alpha - 0.008);
        }

        p.alpha += (targetAlpha - p.alpha) * 0.05;

        if (p.alpha < 0.01) continue;

        const color = p.isGold
          ? `rgba(212,175,55,${p.alpha})`
          : `rgba(255,245,220,${p.alpha * 0.7})`;

        ctx.fillStyle = color;
        if (p.isGold && p.size > 1.2) {
          ctx.shadowColor = 'rgba(212,175,55,0.3)';
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    // Expose phase updater
    const interval = setInterval(() => {
      currentPhase = phase;
    }, 50);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      clearInterval(interval);
    };
  }, [canvasRef, phase]);
}

/* ═══════════════════════════════════════════════════════════════
   Cinematic breath line — a horizontal golden line that expands
   ═══════════════════════════════════════════════════════════════ */
function BreathLine({ visible }) {
  return (
    <motion.div
      className="intro-breath-line"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{
        scaleX: visible ? 1 : 0,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   The main IntroAnimation — a 6-act cinematic sequence
   
   Act 0: Darkness. Particles begin to converge.
   Act 1: Stars settle. A golden breath line appears.
   Act 2: The orb pulses to life. Particles orbit.
   Act 3: "Yashñ" emerges letter by letter from golden dust.
   Act 4: Poetic lines fade in below — "built from silence..."
   Act 5: Everything dissolves into soft golden fog.
   ═══════════════════════════════════════════════════════════════ */
export default function IntroAnimation({ onComplete, audioRef }) {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef(null);
  const title = 'Yashñ';

  // Poetic lines that appear sequentially in phase 4
  const poeticLines = useMemo(() => [
    'built from silence.',
    'built from 3am.',
    'built so no one sits alone.',
  ], []);

  const [currentLine, setCurrentLine] = useState(-1);

  // Canvas particle system
  useParticleCanvas(canvasRef, phase);

  // Master timeline
  useEffect(() => {
    if (audioRef?.current?.transitionTo) {
      audioRef.current.transitionTo('intro');
    }

    const seq = [
      { p: 1, t: 800 },      // Particles start converging, breath line
      { p: 2, t: 4500 },     // Golden orb appears
      { p: 3, t: 7500 },     // Title appears
      { p: 4, t: 11500 },    // Poetic lines begin
      { p: 5, t: 19000 },    // Dissolve out
    ];
    const timers = seq.map(s => setTimeout(() => setPhase(s.p), s.t));
    return () => timers.forEach(clearTimeout);
  }, [audioRef]);

  // Poetic lines sequencer
  useEffect(() => {
    if (phase !== 4) return;

    const delays = [0, 2400, 4800];
    const timers = delays.map((d, i) =>
      setTimeout(() => setCurrentLine(i), d)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Handle completion
  useEffect(() => {
    if (phase === 5) {
      if (audioRef?.current?.stopAmbience) {
        audioRef.current.stopAmbience();
      }
      const t = setTimeout(onComplete, 3500);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete, audioRef]);

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          className="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(30px)', scale: 1.05 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        >
          {/* Canvas particle field */}
          <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />

          {/* Deep vignette overlay */}
          <div className="intro-vignette" />

          {/* Atmospheric fog layers */}
          <motion.div
            className="intro-fog intro-fog-1"
            animate={{
              x: [0, 30, -20, 0],
              opacity: phase >= 1 ? [0, 0.15, 0.08, 0.12] : 0,
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="intro-fog intro-fog-2"
            animate={{
              x: [0, -25, 15, 0],
              opacity: phase >= 1 ? [0, 0.1, 0.06, 0.1] : 0,
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />

          {/* Breath line — appears in phase 1 */}
          <BreathLine visible={phase >= 1 && phase < 3} />

          {/* Central golden orb — pulses to life in phase 2 */}
          <div className="intro-center">
            <motion.div
              className="intro-orb-outer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: phase >= 2 ? [0, 1.3, 1] : 0,
                opacity: phase >= 2 ? [0, 0.8, 0.5] : 0,
              }}
              transition={{ duration: 5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="intro-orb-core"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: phase >= 2 ? 1 : 0,
                opacity: phase >= 2 ? 1 : 0,
              }}
              transition={{ duration: 4, delay: 0.5, ease: 'easeOut' }}
            />
            {/* Inner pulse ring */}
            {phase >= 2 && (
              <motion.div
                className="intro-orb-ring"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{
                  scale: [0.6, 1.8, 2.5],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeOut',
                }}
              />
            )}
          </div>

          {/* Title and subtitle area */}
          <div className="intro-text">
            {/* Title — letter by letter with staggered golden dust effect */}
            <div className="intro-title-wrap">
              {title.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  className="intro-letter"
                  initial={{ opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.8 }}
                  animate={{
                    opacity: phase >= 3 ? 1 : 0,
                    y: phase >= 3 ? 0 : 30,
                    filter: phase >= 3 ? 'blur(0px)' : 'blur(12px)',
                    scale: phase >= 3 ? 1 : 0.8,
                  }}
                  transition={{
                    duration: 2,
                    delay: phase >= 3 ? i * 0.3 + 0.2 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {letter}
                  {/* Golden shimmer behind each letter as it appears */}
                  {phase >= 3 && (
                    <motion.span
                      className="intro-letter-glow"
                      initial={{ opacity: 0.8, scale: 2 }}
                      animate={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 2.5, delay: i * 0.3, ease: 'easeOut' }}
                    />
                  )}
                </motion.span>
              ))}
            </div>

            {/* Poetic lines — sequential fade in */}
            <div className="intro-poetic-area">
              <AnimatePresence mode="wait">
                {phase >= 4 && currentLine >= 0 && (
                  <motion.p
                    key={currentLine}
                    className="intro-poetic"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  >
                    {poeticLines[currentLine]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Film grain overlay for cinematic texture */}
          <div className="intro-grain" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
