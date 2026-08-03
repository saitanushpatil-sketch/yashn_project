import React, { useState, useEffect, useCallback } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const complete = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      sessionStorage.setItem('yashn_intro_played', 'true');
      onComplete();
    }, 800); // Wait for fade out animation
  }, [isFadingOut, onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      complete();
    }, 4300);

    return () => clearTimeout(timer);
  }, [complete]);

  return (
    <div className={`intro-container ${isFadingOut ? 'fade-out' : ''}`} onClick={complete}>
      <div className="intro-content">
        <div className="orb"></div>
        <h1 className="brand-name">Yashñ</h1>
        <p className="tagline">you're not the last option here</p>
      </div>
    </div>
  );
}
