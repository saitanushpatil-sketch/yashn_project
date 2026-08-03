import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete, audioRef }) {
  const [phase, setPhase] = useState(0);

  // Generate field of stars
  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5, // Appear one by one
      size: Math.random() * 2 + 1,
    }));
  }, []);

  // Generate orbiting particles
  const orbitParticles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      angle: Math.random() * 360,
      radius: Math.random() * 50 + 100, // 100px to 150px orbit
      duration: Math.random() * 10 + 15, // Slow orbit
      delay: Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    if (audioRef?.current) {
      // Swell music for intro
      audioRef.current.setVolume(0.5);
    }

    const sequence = [
      { p: 1, time: 2000 }, // Stars appear one by one
      { p: 2, time: 5000 }, // Large golden orb forms
      { p: 3, time: 8000 }, // "Yashñ" fades in
      { p: 4, time: 10000 }, // Subtitle appears
      { p: 5, time: 14000 }, // Trigger dissolve out
    ];

    const timers = sequence.map(seq => 
      setTimeout(() => setPhase(seq.p), seq.time)
    );

    return () => timers.forEach(clearTimeout);
  }, [audioRef]);

  useEffect(() => {
    if (phase === 5) {
      if (audioRef?.current) {
        // Fade out music completely
        audioRef.current.stopAmbience();
      }
      setTimeout(() => {
        onComplete();
      }, 3000); // Wait for dissolve animation to finish
    }
  }, [phase, onComplete, audioRef]);

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div 
          className="intro-container-phase2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(30px)' }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          {/* Stars */}
          <div className="stars-layer">
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="tiny-star"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? [0, 1, 0.5, 1] : 0 }}
                transition={{
                  opacity: { delay: star.delay, duration: 4, repeat: Infinity, repeatType: "mirror" }
                }}
                style={{
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
              />
            ))}
          </div>

          <div className="center-orb-wrapper">
            {/* Golden Orb */}
            <motion.div 
              className="large-golden-orb"
              initial={{ scale: 0, opacity: 0, filter: 'blur(50px)' }}
              animate={{ 
                scale: phase >= 2 ? 1 : 0, 
                opacity: phase >= 2 ? 1 : 0,
                filter: phase >= 2 ? 'blur(20px)' : 'blur(50px)'
              }}
              transition={{ duration: 5, ease: "easeOut" }}
            />

            {/* Orbiting Particles */}
            <AnimatePresence>
              {phase >= 2 && orbitParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="orbit-particle-container"
                  initial={{ opacity: 0, rotate: particle.angle }}
                  animate={{ 
                    opacity: 1, 
                    rotate: particle.angle + 360 
                  }}
                  transition={{ 
                    opacity: { duration: 2, delay: particle.delay },
                    rotate: { duration: particle.duration, repeat: Infinity, ease: "linear" }
                  }}
                >
                  <div 
                    className="orbit-particle" 
                    style={{ transform: `translateY(-${particle.radius}px)` }} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="intro-text-content">
            <motion.h1 
              className="intro-title-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            >
              Yashñ
            </motion.h1>

            <motion.p 
              className="intro-subtitle-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 4 ? 1 : 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            >
              Your companion.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
