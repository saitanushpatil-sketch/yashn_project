import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroAnimation.css';

/* ═══════════════════════════════════════════════════════════════
   Canvas Star & Orb System — The Heart of the Intro
   
   Phase 0: Pure darkness
   Phase 1: Stars appear — hundreds of golden points twinkling
   Phase 2: Stars spiral inward → a magnificent golden orb forms
   Phase 3: Yashñ text fades in over the orb
   Phase 4: Everything dissolves into golden fog → exit
   ═══════════════════════════════════════════════════════════════ */

function useStarfieldCanvas(canvasRef, phaseRef) {
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const startTimeRef = useRef(null);

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

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    // Generate 400 stars scattered across the screen
    const STAR_COUNT = 400;
    starsRef.current = Array.from({ length: STAR_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distFromCenter = 20 + Math.random() * Math.min(w, h) * 0.35;
      const isLarge = Math.random() < 0.08;
      const isMedium = Math.random() < 0.2;
      return {
        // Start position — scattered across screen
        x: cx + (Math.random() - 0.5) * w * 1.2,
        y: cy + (Math.random() - 0.5) * h * 1.2,
        // Original position for reference
        ox: 0, oy: 0, // set after init
        // Target for convergence (toward center)
        tx: cx + Math.cos(angle) * distFromCenter * 0.15,
        ty: cy + Math.sin(angle) * distFromCenter * 0.15,
        // Visual properties
        size: isLarge ? 2.5 + Math.random() * 2 : isMedium ? 1.2 + Math.random() * 1.5 : 0.4 + Math.random() * 1.2,
        baseAlpha: 0,
        alpha: 0,
        maxAlpha: isLarge ? 0.9 + Math.random() * 0.1 : 0.2 + Math.random() * 0.6,
        // Twinkling
        twinkleSpeed: 0.008 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2,
        // Color variation
        hue: 35 + Math.random() * 20, // gold range 35-55
        saturation: 60 + Math.random() * 30,
        lightness: 55 + Math.random() * 30,
        isGold: Math.random() < 0.65,
        // Appearance delay (staggered star reveal)
        delay: Math.random() * 1200,
        // For convergence
        convergenceAngle: angle,
        convergenceDist: distFromCenter,
        // Glow for larger stars
        hasGlow: isLarge || (isMedium && Math.random() < 0.4),
        glowSize: isLarge ? 8 + Math.random() * 12 : 4 + Math.random() * 6,
      };
    });

    // Save original positions
    starsRef.current.forEach(s => { s.ox = s.x; s.oy = s.y; });

    startTimeRef.current = performance.now();

    const draw = (now) => {
      const elapsed = now - startTimeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const phase = phaseRef.current;

      ctx.clearRect(0, 0, w, h);

      // ── Draw golden fog background layers ──
      if (phase >= 1) {
        const fogAlpha = phase >= 4 ? Math.min((elapsed - 8500) / 2000, 1) * 0.15 : 0.04;
        const grad1 = ctx.createRadialGradient(cx * 0.3, cy * 0.4, 0, cx * 0.3, cy * 0.4, w * 0.5);
        grad1.addColorStop(0, `rgba(212,175,55,${fogAlpha})`);
        grad1.addColorStop(0.5, `rgba(212,175,55,${fogAlpha * 0.3})`);
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, w, h);

        const grad2 = ctx.createRadialGradient(cx * 1.6, cy * 1.3, 0, cx * 1.6, cy * 1.3, w * 0.4);
        grad2.addColorStop(0, `rgba(180,140,40,${fogAlpha * 0.7})`);
        grad2.addColorStop(0.5, `rgba(180,140,40,${fogAlpha * 0.2})`);
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Phase 4: Golden fog fills up ──
      if (phase >= 4) {
        const fogProg = Math.min((elapsed - 8500) / 2500, 1);
        const fogGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
        fogGrad.addColorStop(0, `rgba(212,175,55,${fogProg * 0.25})`);
        fogGrad.addColorStop(0.4, `rgba(212,175,55,${fogProg * 0.12})`);
        fogGrad.addColorStop(1, `rgba(0,0,0,${fogProg * 0.8})`);
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Draw stars ──
      for (const star of starsRef.current) {
        const starElapsed = elapsed - star.delay;
        if (starElapsed < 0) continue;

        let x, y, alpha;

        if (phase === 0 || phase === 1) {
          // Phase 1: Stars appear and twinkle in place
          const appearProg = Math.min(starElapsed / 800, 1);
          const eased = 1 - Math.pow(1 - appearProg, 3);
          alpha = star.maxAlpha * eased;

          // Twinkling
          const twinkle = 0.5 + 0.5 * Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset);
          alpha *= (0.4 + 0.6 * twinkle);
          
          x = star.x;
          y = star.y;
        } else if (phase === 2) {
          // Phase 2: Stars converge toward center (spiral inward)
          const convStart = 3500;
          const convDuration = 2500;
          const convElapsed = Math.max(0, elapsed - convStart);
          const convProg = Math.min(convElapsed / convDuration, 1);
          const ease = convProg < 0.5
            ? 4 * convProg * convProg * convProg
            : 1 - Math.pow(-2 * convProg + 2, 3) / 2;

          // Spiral convergence
          const spiralAngle = star.convergenceAngle + convProg * Math.PI * 2;
          const currentDist = star.convergenceDist * (1 - ease * 0.85);
          
          const startX = star.ox;
          const startY = star.oy;
          const targetX = cx + Math.cos(spiralAngle) * currentDist * 0.1;
          const targetY = cy + Math.sin(spiralAngle) * currentDist * 0.1;

          x = startX + (targetX - startX) * ease;
          y = startY + (targetY - startY) * ease;

          // Stars get brighter as they converge, then fade into the orb
          const twinkle = 0.5 + 0.5 * Math.sin(elapsed * star.twinkleSpeed * 2 + star.twinkleOffset);
          const fadeTail = convProg > 0.7 ? 1 - (convProg - 0.7) / 0.3 : 1;
          alpha = star.maxAlpha * (0.5 + 0.5 * twinkle) * fadeTail * 1.2;
        } else if (phase === 3) {
          // Phase 3: Stars mostly faded, a few linger around the orb
          const lingerProg = Math.min((elapsed - 6000) / 2000, 1);
          const spiralAngle = star.convergenceAngle + elapsed * 0.0003;
          const dist = 30 + star.convergenceDist * 0.08;
          x = cx + Math.cos(spiralAngle) * dist;
          y = cy + Math.sin(spiralAngle) * dist;
          alpha = star.maxAlpha * 0.15 * (1 - lingerProg * 0.5);
          alpha *= 0.5 + 0.5 * Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset);
        } else {
          // Phase 4: All stars dissolve outward
          const dissolveProg = Math.min((elapsed - 8500) / 2000, 1);
          const spiralAngle = star.convergenceAngle + elapsed * 0.001;
          const dist = 50 + dissolveProg * w * 0.5;
          x = cx + Math.cos(spiralAngle) * dist;
          y = cy + Math.sin(spiralAngle) * dist;
          alpha = star.maxAlpha * 0.1 * (1 - dissolveProg);
        }

        if (alpha < 0.005) continue;
        alpha = Math.min(alpha, 1);

        // Draw glow first for larger stars
        if (star.hasGlow && alpha > 0.1) {
          const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, star.glowSize);
          if (star.isGold) {
            glowGrad.addColorStop(0, `rgba(212,175,55,${alpha * 0.3})`);
            glowGrad.addColorStop(0.5, `rgba(212,175,55,${alpha * 0.08})`);
          } else {
            glowGrad.addColorStop(0, `rgba(255,245,220,${alpha * 0.25})`);
            glowGrad.addColorStop(0.5, `rgba(255,245,220,${alpha * 0.06})`);
          }
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(x, y, star.glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw star point
        if (star.isGold) {
          ctx.fillStyle = `rgba(212,175,55,${alpha})`;
        } else {
          ctx.fillStyle = `hsla(${star.hue},${star.saturation}%,${star.lightness}%,${alpha})`;
        }

        // Draw as a soft point with a tiny cross for bright stars
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross/spike for very bright large stars
        if (star.size > 2 && alpha > 0.5) {
          ctx.strokeStyle = `rgba(212,175,55,${alpha * 0.3})`;
          ctx.lineWidth = 0.5;
          const spike = star.size * 3;
          ctx.beginPath();
          ctx.moveTo(x - spike, y);
          ctx.lineTo(x + spike, y);
          ctx.moveTo(x, y - spike);
          ctx.lineTo(x, y + spike);
          ctx.stroke();
        }
      }

      // ── Draw the Golden Orb (Phase 2+) ──
      if (phase >= 2) {
        const orbAppearStart = 3500;
        const orbAppearDuration = 2000;
        const orbElapsed = Math.max(0, elapsed - orbAppearStart);
        let orbProg = Math.min(orbElapsed / orbAppearDuration, 1);
        // Ease out expo
        orbProg = orbProg === 1 ? 1 : 1 - Math.pow(2, -10 * orbProg);

        // Dissolve in phase 4
        let orbFade = 1;
        if (phase >= 4) {
          orbFade = Math.max(0, 1 - (elapsed - 8500) / 2000);
        }

        const orbAlpha = orbProg * orbFade;
        if (orbAlpha > 0.01) {
          const orbRadius = Math.min(w, h) * 0.12;

          // Layer 1: Outermost soft glow
          const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 3.5);
          outerGlow.addColorStop(0, `rgba(212,175,55,${orbAlpha * 0.12})`);
          outerGlow.addColorStop(0.3, `rgba(212,175,55,${orbAlpha * 0.06})`);
          outerGlow.addColorStop(0.6, `rgba(180,140,40,${orbAlpha * 0.02})`);
          outerGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = outerGlow;
          ctx.beginPath();
          ctx.arc(cx, cy, orbRadius * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Layer 2: Medium glow with breathing
          const breathe = 1 + 0.08 * Math.sin(elapsed * 0.002);
          const midGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 2 * breathe);
          midGlow.addColorStop(0, `rgba(212,175,55,${orbAlpha * 0.25})`);
          midGlow.addColorStop(0.4, `rgba(212,175,55,${orbAlpha * 0.12})`);
          midGlow.addColorStop(0.7, `rgba(212,175,55,${orbAlpha * 0.04})`);
          midGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = midGlow;
          ctx.beginPath();
          ctx.arc(cx, cy, orbRadius * 2 * breathe, 0, Math.PI * 2);
          ctx.fill();

          // Layer 3: Core — bright solid center
          const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 0.8);
          coreGlow.addColorStop(0, `rgba(255,235,180,${orbAlpha * 0.6})`);
          coreGlow.addColorStop(0.3, `rgba(212,175,55,${orbAlpha * 0.4})`);
          coreGlow.addColorStop(0.6, `rgba(212,175,55,${orbAlpha * 0.15})`);
          coreGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = coreGlow;
          ctx.beginPath();
          ctx.arc(cx, cy, orbRadius * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Layer 4: Hot white center
          const hotCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 0.25);
          hotCore.addColorStop(0, `rgba(255,250,230,${orbAlpha * 0.7})`);
          hotCore.addColorStop(0.5, `rgba(255,235,180,${orbAlpha * 0.3})`);
          hotCore.addColorStop(1, 'transparent');
          ctx.fillStyle = hotCore;
          ctx.beginPath();
          ctx.arc(cx, cy, orbRadius * 0.25, 0, Math.PI * 2);
          ctx.fill();

          // Expanding pulse rings
          const ringCount = 3;
          for (let r = 0; r < ringCount; r++) {
            const ringCycle = 4000;
            const ringTime = (elapsed + r * (ringCycle / ringCount)) % ringCycle;
            const ringProg = ringTime / ringCycle;
            const ringRadius = orbRadius * (0.5 + ringProg * 2.5);
            const ringAlpha = (1 - ringProg) * orbAlpha * 0.15;
            
            if (ringAlpha > 0.005) {
              ctx.strokeStyle = `rgba(212,175,55,${ringAlpha})`;
              ctx.lineWidth = 1 - ringProg * 0.8;
              ctx.beginPath();
              ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          // Light rays emanating from orb
          if (orbAlpha > 0.3) {
            const rayCount = 8;
            for (let r = 0; r < rayCount; r++) {
              const rayAngle = (r / rayCount) * Math.PI * 2 + elapsed * 0.0002;
              const rayLength = orbRadius * (2 + 0.5 * Math.sin(elapsed * 0.001 + r));
              const rayAlpha = orbAlpha * 0.08 * (0.5 + 0.5 * Math.sin(elapsed * 0.003 + r * 2));
              
              const rayGrad = ctx.createLinearGradient(
                cx, cy,
                cx + Math.cos(rayAngle) * rayLength,
                cy + Math.sin(rayAngle) * rayLength
              );
              rayGrad.addColorStop(0, `rgba(212,175,55,${rayAlpha})`);
              rayGrad.addColorStop(1, 'transparent');
              
              ctx.strokeStyle = rayGrad;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(
                cx + Math.cos(rayAngle) * rayLength,
                cy + Math.sin(rayAngle) * rayLength
              );
              ctx.stroke();
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, phaseRef]); // refs are stable; this effect still mounts once
}

/* ═══════════════════════════════════════════════════════════════
   IntroAnimation — Orchestrated 4-phase cinematic sequence
   
   Total duration: ~10 seconds (down from 22+)
   Phase 0 → 1: 0.5s    (stars start appearing)
   Phase 1 → 2: 3.5s    (stars settle, then converge into orb)  
   Phase 2 → 3: 6s      (orb formed, title appears)
   Phase 3 → 4: 8.5s    (title shown, begin dissolve)
   Exit:        10.5s    (onComplete fired)
   ═══════════════════════════════════════════════════════════════ */
export default function IntroAnimation({ onComplete, audioRef }) {
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const canvasRef = useRef(null);
  const title = 'Yashñ';

  // Keep phaseRef in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Canvas particle system
  useStarfieldCanvas(canvasRef, phaseRef);

  // Master timeline — much faster
  useEffect(() => {
    if (audioRef?.current?.transitionTo) {
      audioRef.current.transitionTo('intro');
    }

    const timers = [
      setTimeout(() => setPhase(1), 300),     // Stars begin
      setTimeout(() => setPhase(2), 3200),    // Stars converge → orb
      setTimeout(() => setPhase(3), 5800),    // Title appears
      setTimeout(() => setPhase(4), 8500),    // Dissolve
    ];
    return () => timers.forEach(clearTimeout);
  }, [audioRef]);

  // Handle completion
  useEffect(() => {
    if (phase === 4) {
      if (audioRef?.current?.stopAmbience) {
        audioRef.current.stopAmbience();
      }
      const t = setTimeout(onComplete, 2200);
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
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          {/* Canvas — stars, orb, fog all rendered here */}
          <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />

          {/* Deep cinematic vignette */}
          <div className="intro-vignette" />

          {/* Floating golden fog overlays (CSS animated) */}
          <motion.div
            className="intro-fog intro-fog-1"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase >= 1 ? [0, 0.15, 0.08, 0.15] : 0,
              x: [0, 40, -30, 0],
              y: [0, -15, 10, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="intro-fog intro-fog-2"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase >= 1 ? [0, 0.1, 0.06, 0.1] : 0,
              x: [0, -30, 20, 0],
              y: [0, 20, -10, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="intro-fog intro-fog-3"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase >= 2 ? [0, 0.12, 0.05, 0.12] : 0,
              x: [0, 20, -15, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />

          {/* Title area — positioned over the orb */}
          <div className="intro-text">
            <div className="intro-title-wrap">
              {title.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  className="intro-letter"
                  initial={{ opacity: 0, y: 20, filter: 'blur(16px)', scale: 0.85 }}
                  animate={{
                    opacity: phase >= 3 ? 1 : 0,
                    y: phase >= 3 ? 0 : 20,
                    filter: phase >= 3 ? 'blur(0px)' : 'blur(16px)',
                    scale: phase >= 3 ? 1 : 0.85,
                  }}
                  transition={{
                    duration: 1.8,
                    delay: phase >= 3 ? i * 0.18 + 0.1 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {letter}
                  {/* Golden shimmer burst behind each letter */}
                  {phase >= 3 && (
                    <motion.span
                      className="intro-letter-glow"
                      initial={{ opacity: 0.9, scale: 2.5 }}
                      animate={{ opacity: 0, scale: 0.3 }}
                      transition={{ duration: 2, delay: i * 0.18, ease: 'easeOut' }}
                    />
                  )}
                </motion.span>
              ))}
            </div>

            {/* Subtle tagline under the title */}
            <motion.p
              className="intro-tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: phase >= 3 ? 0.4 : 0,
                y: phase >= 3 ? 0 : 10,
              }}
              transition={{
                duration: 2,
                delay: phase >= 3 ? 1.2 : 0,
                ease: 'easeOut',
              }}
            >
              so no one sits alone
            </motion.p>
          </div>

          {/* Film grain overlay */}
          <div className="intro-grain" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
