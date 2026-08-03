import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete, audioRef }) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  // Generate a field of tiny, slowly drifting stars
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      size: Math.random() * 1.5 + 0.5,
    }));
  }, []);

  useEffect(() => {
    const sequence = [
      { p: 1, time: 1000 }, // Pitch black to first stars
      { p: 2, time: 3500 }, // Golden ambient light fades in
      { p: 3, time: 6000 }, // Yashñ logo fades in
      { p: 4, time: 7500 }, // Subtitle fades in
      { p: 5, time: 9000 }, // Enter button appears
    ];

    const timers = sequence.map(seq => 
      setTimeout(() => setPhase(seq.p), seq.time)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnterClick = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    
    // Start ambient audio via ref if provided
    if (audioRef && audioRef.current) {
      audioRef.current.toggleAmbience();
    }

    // Smooth exit transition
    setTimeout(() => {
      sessionStorage.setItem('yashn_intro_played', 'true');
      onComplete();
    }, 2000);
  }, [exiting, onComplete, audioRef]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div 
          className="cinematic-intro-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Star Field */}
          <div className="intro-stars-layer">
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="intro-star"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? [0, 0.8, 0.4, 0.8] : 0 }}
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

          {/* Golden Ambient Glow */}
          <motion.div 
            className="intro-ambient-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 4, ease: "easeIn" }}
          />

          <div className="intro-content">
            <motion.h1 
              className="intro-logo"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ 
                opacity: phase >= 3 ? 1 : 0, 
                y: phase >= 3 ? 0 : 20,
                filter: phase >= 3 ? 'blur(0px)' : 'blur(10px)'
              }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            >
              Yashñ
            </motion.h1>

            <motion.p 
              className="intro-subtitle"
              initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
              animate={{ 
                opacity: phase >= 4 ? 1 : 0, 
                y: phase >= 4 ? 0 : 10,
                filter: phase >= 4 ? 'blur(0px)' : 'blur(5px)'
              }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              Your companion.
            </motion.p>

            <motion.button 
              className="intro-enter-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: phase >= 5 ? 1 : 0, scale: phase >= 5 ? 1 : 0.9 }}
              transition={{ duration: 1.5 }}
              onClick={handleEnterClick}
              disabled={phase < 5 || exiting}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(212,175,120,0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              Enter
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
