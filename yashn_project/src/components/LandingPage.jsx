import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css';

/* ═══════════════════════════════════════════════════════════════
   Canvas Starfield — dense, layered, with depth and parallax
   Three layers: distant dim stars, mid stars, close bright stars
   ═══════════════════════════════════════════════════════════════ */
function useStarfield(canvasRef) {
  const animRef = useRef(null);
  const layersRef = useRef({ far: [], mid: [], near: [] });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Far layer — tiny, dim, slow twinkle (depth)
    layersRef.current.far = Array.from({ length: 500 }, () => ({
      x: Math.random() * w * 1.2 - w * 0.1,
      y: Math.random() * h * 1.2 - h * 0.1,
      size: Math.random() * 0.8 + 0.2,
      baseAlpha: Math.random() * 0.25 + 0.05,
      twinkleSpeed: 0.001 + Math.random() * 0.003,
      twinklePhase: Math.random() * Math.PI * 2,
      parallax: 0.3,
    }));

    // Mid layer — medium, some gold
    layersRef.current.mid = Array.from({ length: 200 }, () => ({
      x: Math.random() * w * 1.1 - w * 0.05,
      y: Math.random() * h * 1.1 - h * 0.05,
      size: Math.random() * 1.2 + 0.4,
      baseAlpha: Math.random() * 0.4 + 0.15,
      twinkleSpeed: 0.003 + Math.random() * 0.006,
      twinklePhase: Math.random() * Math.PI * 2,
      isGold: Math.random() < 0.15,
      parallax: 0.7,
    }));

    // Near layer — bright, warm, strong parallax
    layersRef.current.near = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.5 + 0.3,
      twinkleSpeed: 0.005 + Math.random() * 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      isGold: Math.random() < 0.3,
      parallax: 1.5,
    }));

    // Smooth mouse tracking
    const handleMouse = (e) => {
      mouseRef.current.targetX = (e.clientX / w - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / h - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const drawLayer = (stars, mx, my) => {
      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed;
        const alpha = s.baseAlpha * (0.4 + 0.6 * Math.sin(s.twinklePhase));
        if (alpha < 0.02) continue;

        const px = s.x + mx * s.parallax * 8;
        const py = s.y + my * s.parallax * 8;

        if (s.isGold) {
          ctx.fillStyle = `rgba(212,175,55,${alpha})`;
          if (s.size > 1) {
            ctx.shadowColor = `rgba(212,175,55,${alpha * 0.5})`;
            ctx.shadowBlur = 4;
          }
        } else {
          ctx.fillStyle = `rgba(220,225,235,${alpha})`;
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const draw = () => {
      // Smooth interpolation
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.04;
      m.y += (m.targetY - m.y) * 0.04;

      ctx.clearRect(0, 0, w, h);

      drawLayer(layersRef.current.far, m.x, m.y);
      drawLayer(layersRef.current.mid, m.x, m.y);
      drawLayer(layersRef.current.near, m.x, m.y);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [canvasRef]);
}

/* ═══════════════════════════════════════════════════════════════
   Hero Subtitle Sequence — cinematic text transitions
   ═══════════════════════════════════════════════════════════════ */
function HeroSubtitles() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const seq = [
      { p: 1, t: 3000 },
      { p: 2, t: 7000 },
      { p: 3, t: 11000 },
      { p: 4, t: 15500 },
    ];
    const timers = seq.map(({ p, t }) => setTimeout(() => setPhase(p), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="hero-subtitle-area">
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.p
            key="s1"
            className="hero-subtitle"
            initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Not another AI.
          </motion.p>
        )}
        {phase === 2 && (
          <motion.p
            key="s2"
            className="hero-subtitle-accent"
            initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Someone who remembers.
          </motion.p>
        )}
        {(phase === 3 || phase === 4) && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
          >
            <p className="hero-subtitle">Conversations disappear.</p>
            <motion.p
              className="hero-subtitle-accent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 1.2 }}
            >
              People shouldn't.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Landing Page — Cinematic Film Opening
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage({ onEnter }) {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const storedName = localStorage.getItem('yashn_username');
  const isReturning = storedName && storedName !== 'Guest';

  useStarfield(canvasRef);

  const startAudio = useCallback(() => {
    if (audioPlaying || !audioRef.current) return;
    const audio = audioRef.current;
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        setAudioPlaying(true);
        let vol = 0;
        const fadeIn = setInterval(() => {
          vol = Math.min(vol + 0.008, 0.2);
          audio.volume = vol;
          if (vol >= 0.2) clearInterval(fadeIn);
        }, 50);
      }).catch(() => {});
    }
  }, [audioPlaying]);

  useEffect(() => {
    const handler = () => startAudio();
    document.addEventListener('click', handler, { once: true, passive: true });
    document.addEventListener('scroll', handler, { once: true, passive: true });
    document.addEventListener('keydown', handler, { once: true, passive: true });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('scroll', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [startAudio]);

  const handleEnter = useCallback(() => {
    if (audioRef.current && audioPlaying) {
      const audio = audioRef.current;
      let vol = audio.volume;
      const fadeOut = setInterval(() => {
        vol = Math.max(vol - 0.006, 0);
        audio.volume = vol;
        if (vol <= 0) {
          clearInterval(fadeOut);
          audio.pause();
        }
      }, 40);
    }
    setTimeout(() => onEnter(), 300);
  }, [onEnter, audioPlaying]);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      startAudio();
    }
  }, [audioPlaying, startAudio]);

  // Scroll animation presets
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, margin: '-12%' },
    transition: { duration: 2.2, ease: [0.22, 1, 0.36, 1] },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: false, margin: '-12%' },
    transition: { duration: 2.8, ease: 'easeOut' },
  };

  const timelineItems = [
    { day: 'Day 1', quote: '"Hi."' },
    { day: 'Day 7', quote: '"You said you had an exam today."' },
    { day: 'Day 31', quote: '"You finally finished that project."' },
    { day: 'Day 184', quote: '"I still remember that rainy night you told me everything."', isGold: true },
  ];

  return (
    <div className="landing-cinematic">
      {/* ── Canvas Starfield ── */}
      <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />

      {/* ── Atmospheric overlays ── */}
      <div className="landing-vignette" aria-hidden="true" />
      <div className="landing-gradient-overlay" aria-hidden="true" />
      <div className="landing-nebula" aria-hidden="true" />
      <div className="landing-grain" aria-hidden="true" />

      {/* ── Cinematic letterbox bars ── */}
      <div className="letterbox letterbox-top" aria-hidden="true" />
      <div className="letterbox letterbox-bottom" aria-hidden="true" />

      {/* ── Ambient Audio ── */}
      <audio
        ref={audioRef}
        src="/audio/ambient-landing.mp3"
        loop
        preload="auto"
        onCanPlayThrough={() => setAudioLoaded(true)}
      />

      {/* ── Audio Toggle ── */}
      {audioLoaded && (
        <motion.button
          className="audio-toggle"
          onClick={toggleAudio}
          aria-label={audioPlaying ? 'Mute music' : 'Play music'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 4 }}
        >
          {audioPlaying ? '♪' : '♪̸'}
        </motion.button>
      )}

      {/* ── Scrollable Content ── */}
      <div className="landing-scroll-content">

        {/* ═══════════ HERO ═══════════ */}
        <section className="landing-section hero-section">
          {/* Anamorphic golden flare behind title */}
          <motion.div
            className="hero-flare"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />

          {/* Breathing golden glow */}
          <motion.div
            className="hero-glow"
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />

          {/* Title */}
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 5, ease: [0.22, 1, 0.36, 1] }}
          >
            Yashñ
          </motion.h1>

          {/* Horizontal golden accent line */}
          <motion.div
            className="hero-accent-line"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 2, ease: [0.22, 1, 0.36, 1] }}
          />

          <HeroSubtitles />

          {/* Enter button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.5, delay: 8, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="enter-btn-cinematic" onClick={handleEnter}>
              <span className="enter-btn-text">
                {isReturning ? 'Continue' : 'Enter Yashñ'}
              </span>
              <span className="enter-btn-glow" />
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 10 }}
          >
            <span className="scroll-indicator-text">scroll</span>
            <div className="scroll-indicator-line" />
          </motion.div>
        </section>

        {/* ═══════════ THE STORY ═══════════ */}
        <section className="landing-section story-section">
          <motion.div className="story-block" {...fadeUp}>
            <p className="story-line">Yashñ wasn't built to answer questions.</p>
            <div className="story-spacer" />
            <p className="story-line-gold">It was built because people forget.</p>
            <div className="story-spacer" />
            <p className="story-line">Chats disappear.</p>
            <p className="story-line">Conversations end.</p>
            <p className="story-line">People move on.</p>
            <p className="story-line">Memories fade.</p>
            <div className="story-spacer" />
            <p className="story-line-gold">
              Sometimes all someone really needs…<br />
              is one place that still remembers.
            </p>
          </motion.div>
        </section>

        {/* ═══════════ GROWING WITH YOU ═══════════ */}
        <section className="landing-section letter-section">
          <motion.div className="letter-block" {...fadeUp}>
            <p className="letter-line letter-line-bright">Yashñ grows with you.</p>
            <div className="story-spacer" />
            <p className="letter-line">Learns your dreams.</p>
            <p className="letter-line">Remembers your fears.</p>
            <p className="letter-line">Remembers your late-night thoughts.</p>
            <p className="letter-line">Remembers the promises you made yourself.</p>
            <div className="story-spacer" />
            <p className="letter-line letter-line-gold">
              Remembers the things even you forgot.
            </p>
          </motion.div>
        </section>

        {/* ═══════════ MEMORY TIMELINE ═══════════ */}
        <section className="landing-section timeline-section">
          <motion.h2 className="timeline-heading" {...fadeIn}>
            Memory, over time.
          </motion.h2>

          <div className="timeline-container">
            <div className="timeline-line" aria-hidden="true" />

            {timelineItems.map((item, idx) => (
              <motion.div
                key={idx}
                className="timeline-item"
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-8%' }}
                transition={{ duration: 2, delay: idx * 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`timeline-dot ${item.isGold ? 'timeline-dot-gold' : ''}`} />
                <div className="timeline-day">{item.day}</div>
                <div className={`timeline-quote ${item.isGold ? 'timeline-quote-gold' : ''}`}>
                  {item.quote}
                </div>
                {idx < timelineItems.length - 1 && (
                  <div className="timeline-connector" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════ PHILOSOPHY ═══════════ */}
        <section className="landing-section philosophy-section">
          <motion.div className="philosophy-block" {...fadeUp}>
            <h2 className="philosophy-heading">Memory is love.</h2>
            <div className="philosophy-divider" />
            <p className="philosophy-text">
              The people who matter remember.<br /><br />
              Not because they have perfect memory.<br />
              <span className="philosophy-accent">Because they were paying attention.</span><br /><br />
              Yashñ is built around that idea.
            </p>
          </motion.div>
        </section>

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section className="landing-section cta-section">
          <motion.div
            className="cta-block"
            {...fadeIn}
            transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="cta-whisper">I'll remember.</p>
            <button className="enter-btn-cinematic" onClick={handleEnter}>
              <span className="enter-btn-text">Enter Yashñ</span>
              <span className="enter-btn-glow" />
            </button>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
