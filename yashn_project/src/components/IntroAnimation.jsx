import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  
  const audioRef = useRef(null);

  // Generate 80 stars exactly once
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => {
      // Random position
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      // Staggered delay for phase 1 appearance (between 0s and 2.5s)
      const appearDelay = Math.random() * 2.5; 
      // Size
      const size = Math.random() * 2 + 1;
      
      // Exit drift coordinates (random dx/dy from -300px to 300px)
      const dx = `${(Math.random() - 0.5) * 600}px`;
      const dy = `${(Math.random() - 0.5) * 600}px`;

      return { id: i, top, left, appearDelay, size, dx, dy };
    });
  }, []);

  useEffect(() => {
    // Phase 1 (300ms)
    const t1 = setTimeout(() => setPhase(1), 300);
    // Phase 2 (2800ms)
    const t2 = setTimeout(() => setPhase(2), 2800);
    // Phase 3 (3600ms)
    const t3 = setTimeout(() => setPhase(3), 3600);
    // Phase 4 (4200ms)
    const t4 = setTimeout(() => setPhase(4), 4200);
    // Phase 5 (5200ms)
    const t5 = setTimeout(() => setPhase(5), 5200);
    // Phase 6 (6000ms)
    const t6 = setTimeout(() => setPhase(6), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  const handleEnterClick = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    
    // Play audio
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log('Audio play error', e));
    }

    setTimeout(() => {
      sessionStorage.setItem('yashn_intro_played', 'true');
      onComplete();
    }, 1400);
  }, [exiting, onComplete]);

  return (
    <div className={`intro-container ${exiting ? 'exit' : ''}`}>
      {/* Audio element - public domain magical track */}
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_b8c9103636.mp3?filename=magical-twinkle-and-glitter-106518.mp3" 
        preload="auto"
      />

      {/* Stars Layer */}
      <div className="stars-layer">
        {stars.map((star) => (
          <div 
            key={star.id} 
            className={`star ${phase >= 1 ? 'visible' : ''}`}
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              transitionDelay: exiting ? '0s' : `${star.appearDelay}s`,
              '--dx': star.dx,
              '--dy': star.dy
            }}
          />
        ))}
      </div>

      {/* Center Orbs & Rings */}
      <div className="center-visuals">
        <div className={`blur-halo ${phase >= 3 ? 'visible' : ''}`}></div>
        <div className={`ring ring-outer ${phase >= 3 ? 'visible' : ''}`}></div>
        <div className={`ring ring-inner ${phase >= 3 ? 'visible' : ''}`}></div>
        <div className={`aurora-core ${phase >= 2 ? 'visible' : ''}`}></div>
      </div>

      {/* Typography and Button */}
      <div className="text-container">
        <span className={`brand-name ${phase >= 4 ? 'visible' : ''}`}>Yashñ</span>
        <span className={`tagline ${phase >= 5 ? 'visible' : ''}`}>you're not the last option here</span>
        
        <button 
          className={`enter-btn ${phase >= 6 ? 'visible' : ''}`}
          onClick={handleEnterClick}
          disabled={phase < 6 || exiting}
        >
          Enter
        </button>
      </div>

      {/* Bloom on exit */}
      <div className={`radial-bloom ${exiting ? 'visible' : ''}`}></div>
    </div>
  );
}
