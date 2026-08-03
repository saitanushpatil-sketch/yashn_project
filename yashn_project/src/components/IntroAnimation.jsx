import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete, audioRef }) {
  const [phase, setPhase] = useState(0);
  // For letter-by-letter reveal
  const title = 'Yashñ';

  const stars = useMemo(() =>
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 0.4,
      delay: i * 0.08, // Appear one by one, very gradually
    })), []);

  const orbitParticles = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      angle: (360 / 16) * i + Math.random() * 15,
      radius: 60 + Math.random() * 80,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 3,
      size: 1 + Math.random() * 2,
    })), []);

  useEffect(() => {
    // Transition audio to intro theme
    if (audioRef?.current?.transitionTo) {
      audioRef.current.transitionTo('intro');
    }

    const seq = [
      { p: 1, t: 1000 },   // Stars start appearing
      { p: 2, t: 5000 },   // Golden orb grows
      { p: 3, t: 8500 },   // "Yashñ" letter by letter
      { p: 4, t: 12000 },  // "I remember."
      { p: 5, t: 16000 },  // Dissolve out
    ];
    const timers = seq.map(s => setTimeout(() => setPhase(s.p), s.t));
    return () => timers.forEach(clearTimeout);
  }, [audioRef]);

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
          exit={{ opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        >
          {/* Stars */}
          <div className="intro-stars">
            {stars.map(s => (
              <motion.div
                key={s.id}
                className="intro-s"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: phase >= 1 ? [0, 0.8, 0.3, 0.7] : 0,
                  scale: phase >= 1 ? 1 : 0,
                }}
                transition={{
                  delay: s.delay,
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'mirror',
                }}
                style={{
                  top: `${s.top}%`, left: `${s.left}%`,
                  width: `${s.size}px`, height: `${s.size}px`,
                }}
              />
            ))}
          </div>

          {/* Golden orb + orbiting particles */}
          <div className="intro-center">
            <motion.div
              className="intro-orb"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: phase >= 2 ? 1 : 0,
                opacity: phase >= 2 ? 1 : 0,
              }}
              transition={{ duration: 6, ease: 'easeOut' }}
            />

            {phase >= 2 && orbitParticles.map(p => (
              <motion.div
                key={p.id}
                className="intro-orbit"
                initial={{ opacity: 0, rotate: p.angle }}
                animate={{ opacity: 0.7, rotate: p.angle + 360 }}
                transition={{
                  opacity: { duration: 2, delay: p.delay },
                  rotate: { duration: p.duration, repeat: Infinity, ease: 'linear' },
                }}
              >
                <div
                  className="intro-orbit-dot"
                  style={{
                    transform: `translateY(-${p.radius}px)`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Text — letter by letter */}
          <div className="intro-text">
            <div className="intro-title-wrap">
              {title.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  className="intro-letter"
                  initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                  animate={{
                    opacity: phase >= 3 ? 1 : 0,
                    y: phase >= 3 ? 0 : 15,
                    filter: phase >= 3 ? 'blur(0px)' : 'blur(8px)',
                  }}
                  transition={{
                    duration: 1.5,
                    delay: phase >= 3 ? i * 0.25 : 0,
                    ease: 'easeOut',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="intro-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 4 ? 1 : 0 }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            >
              I remember.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
