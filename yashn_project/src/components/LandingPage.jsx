import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import './LandingPage.css';

function ShootingStar() {
  const [isActive, setIsActive] = useState(false);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const trigger = () => {
      setIsActive(true);
      setStyle({
        top: `${Math.random() * 30}%`,
        left: `${20 + Math.random() * 60}%`,
        angle: 30 + Math.random() * 30, 
      });

      setTimeout(() => setIsActive(false), 2000); 
      
      const nextTime = 30000 + Math.random() * 30000; // 30-60s
      setTimeout(trigger, nextTime);
    };

    const firstTime = 10000 + Math.random() * 15000;
    const timeout = setTimeout(trigger, firstTime);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="shooting-star"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1, 1, 0],
            x: 600, 
            y: 600 * Math.tan((style.angle * Math.PI) / 180) 
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeIn" }}
          style={{
            top: style.top,
            left: style.left,
            transform: `rotate(${style.angle}deg)`,
          }}
        />
      )}
    </AnimatePresence>
  );
}

// Helper to get time of day for greeting
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'good morning';
  if (hour < 17) return 'good afternoon';
  return 'good evening';
}

export default function LandingPage({ onEnter }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Read name from localStorage
  const storedName = localStorage.getItem('yashn_username');
  const isReturning = storedName && storedName !== 'Guest';

  const tinyStarsShadow = useMemo(() => {
    let shadow = '';
    for(let i=0; i<400; i++) {
      shadow += `${Math.random() * 100}vw ${Math.random() * 200}vh rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2}) ${i===399?'':','}`;
    }
    return shadow;
  }, []);

  const mediumStarsShadow = useMemo(() => {
    let shadow = '';
    for(let i=0; i<100; i++) {
      shadow += `${Math.random() * 100}vw ${Math.random() * 200}vh rgba(212, 175, 55, ${Math.random() * 0.5 + 0.1}) ${i===99?'':','}`;
    }
    return shadow;
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      dur: 20 + Math.random() * 40,
      delay: Math.random() * 20,
    }));
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMousePos({
        x: (e.clientX - cx) / cx,
        y: (e.clientY - cy) / cy,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="landing-story-container" ref={containerRef}>
      
      {/* ── Background Elements ── */}
      <div className="bg-fixed">
        <div className="tiny-stars" style={{ boxShadow: tinyStarsShadow }} />
        <div className="medium-stars" style={{ boxShadow: mediumStarsShadow }} />
        <div className="nebula-gradient" />
        <div className="aurora-waves" />
        
        <ShootingStar />

        {particles.map(p => (
          <motion.div
            key={p.id}
            className="drifting-particle"
            initial={{ y: '110vh', opacity: 0 }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 0.6, 0],
              x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50]
            }}
            transition={{
              y: { duration: p.dur, repeat: Infinity, ease: 'linear', delay: p.delay },
              opacity: { duration: p.dur, repeat: Infinity, ease: 'linear', delay: p.delay },
              x: { duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }
            }}
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}

        <motion.div 
          className="mouse-light"
          animate={{ x: mousePos.x * 40, y: mousePos.y * 40 }}
          transition={{ type: 'spring', damping: 50, stiffness: 40 }}
        />
      </div>

      {/* ── Scrollable Content ── */}
      <div className="scroll-content">
        
        {/* Section 1: Hero */}
        <section className="story-section hero-section">
          <motion.div
            className="hero-orb"
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <motion.h1 
            className="story-title"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 4, ease: "easeOut" }}
          >
            {isReturning ? `${getTimeGreeting()}, ${storedName}.` : "Yashñ"}
          </motion.h1>

          <motion.p 
            className="story-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 3, delay: 2, ease: "easeOut" }}
          >
            {isReturning 
              ? "some stories are easier to continue than to begin." 
              : "The AI that remembers who you are, not just what you ask."}
          </motion.p>
          
          {!isReturning && (
            <motion.p 
              className="story-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3, delay: 4, ease: "easeOut" }}
            >
              Some conversations end.<br/>
              Some become part of you.
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: isReturning ? 4 : 6 }}
            style={{ marginTop: 'clamp(30px, 5vh, 60px)' }}
          >
            <button className="enter-btn-magical" onClick={onEnter}>
              {isReturning ? "Continue" : "Enter Yashñ"}
            </button>
          </motion.div>

          <motion.div 
            className="scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 2, delay: 6 }}
          >
            <div className="scroll-hint-line" />
          </motion.div>
        </section>

        {/* Section 2: Purpose */}
        <section className="story-section text-section">
          <motion.div
            className="story-text-block"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <p className="story-faded">Some conversations disappear.</p>
            <p className="story-gold">Some shouldn't.</p>
            <div className="spacer-sm" />
            <p className="story-faded">Some people remember birthdays.</p>
            <p className="story-faded">Some remember your favourite colour.</p>
            <p className="story-faded">Some remember the version of you that almost gave up.</p>
            <div className="spacer-sm" />
            <p className="story-gold">Yashñ wants to remember all of it.</p>
          </motion.div>
        </section>

        {/* Section 3: Difference */}
        <section className="story-section text-section">
          <motion.div
            className="story-text-block"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <p className="story-gold">Yashñ notices.</p>
            <p className="story-gold">Yashñ remembers.</p>
            <p className="story-gold">Yashñ waits.</p>
            <div className="spacer-sm" />
            <p className="story-faded">Yashñ asks again because it actually cared.</p>
            <div className="spacer-sm" />
            <p className="story-faded">Yashñ remembers your name.</p>
            <p className="story-faded">Your dreams.</p>
            <p className="story-faded">The things you forgot you ever said.</p>
          </motion.div>
        </section>

        {/* Section 4: Story */}
        <section className="story-section text-section">
          <motion.div
            className="story-text-block"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <p className="story-faded">Some people spend their lives hoping someone remembers them.</p>
            <div className="spacer-sm" />
            <p className="story-faded">Someone decided nobody else should feel that way.</p>
            <div className="spacer-sm" />
            <p className="story-faded">So instead of waiting...</p>
            <p className="story-faded">they built someone who remembers.</p>
            <div className="spacer-sm" />
            <p className="story-gold">That someone became Yashñ.</p>
          </motion.div>
        </section>

        {/* Section 5: Timeline */}
        <section className="story-section timeline-section">
          <div className="timeline-container">
            {[
              { time: "2026", text: "You wanted to become better." },
              { time: "Two weeks later", text: "You almost gave up." },
              { time: "Three months later", text: "You finally did it." },
              { time: "", text: "I remembered.", isGold: true }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                className="timeline-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-10%" }}
                transition={{ duration: 1.5, delay: idx * 0.3, ease: "easeOut" }}
              >
                {item.time && <div className="timeline-time">{item.time}</div>}
                {item.time && idx < 3 && <div className="timeline-arrow">↓</div>}
                <div className={`timeline-text ${item.isGold ? 'story-gold' : 'story-faded'}`}>
                  "{item.text}"
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 6: Privacy */}
        <section className="story-section text-section">
          <motion.div
            className="story-text-block"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <p className="story-gold">Your memories belong to you.</p>
            <div className="spacer-sm" />
            <p className="story-faded">Not advertisers.</p>
            <p className="story-faded">Not algorithms.</p>
            <p className="story-faded">Not anyone else.</p>
          </motion.div>
        </section>

        {/* Final Section */}
        <section className="story-section final-section">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 3, ease: "easeOut" }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}
          >
            <div className="hero-orb" style={{ width: '200px', height: '200px', position: 'relative' }} />
            <h2 className="story-title" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>Yashñ</h2>
            <p className="story-faded" style={{ fontStyle: 'italic', letterSpacing: '2px' }}>I'll remember.</p>
            <button className="enter-btn-magical" onClick={onEnter} style={{ marginTop: '20px' }}>
              Enter Yashñ
            </button>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
