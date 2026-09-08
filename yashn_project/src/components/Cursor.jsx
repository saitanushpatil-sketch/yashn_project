import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const onOver = (e) => {
      const t = e.target;
      setHovering(
        t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' || !!t.closest('button') || !!t.closest('a')
      );
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  if (pos.x === -100) return null;

  return (
    <>
      {/* Core dot — shimmers */}
      <motion.div
        animate={{
          x: pos.x - 5,
          y: pos.y - 5,
          scale: hovering ? 1.8 : 1,
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.08 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'var(--gold)',
          pointerEvents: 'none',
          zIndex: 99999,
          boxShadow: '0 0 12px var(--gold), 0 0 30px var(--gold-glow)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Outer halo */}
      <motion.div
        animate={{
          x: pos.x - 22,
          y: pos.y - 22,
          scale: hovering ? 1.6 : 1,
          opacity: hovering ? 0.7 : 0.25,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.4 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid var(--gold)',
          pointerEvents: 'none',
          zIndex: 99998,
          boxShadow: hovering ? '0 0 20px var(--gold-glow)' : 'none',
        }}
      />
    </>
  );
}
