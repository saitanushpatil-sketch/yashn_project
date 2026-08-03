import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BrainCircuit, Mic, Image as ImageIcon, Heart, Globe } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ onMeetClick }) {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <motion.section 
        className="landing-hero"
        style={{ y: yHero, opacity: opacityHero }}
      >
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          Yashñ
        </motion.h1>
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        >
          Your companion.<br/>Not just another AI.
        </motion.p>
        
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div className="mouse-icon"></div>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <section className="landing-section about-section">
        <motion.div 
          className="premium-card"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5 }}
        >
          <h2>More than software.</h2>
          <p>
            Yashñ is designed to remember the conversations you've shared. It grows with you, understands context intuitively, and is built to feel human, warm, and constantly available when you need someone to talk to.
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="landing-section features-section">
        <div className="features-grid">
          {[
            { icon: BrainCircuit, title: "Remembers You", desc: "Builds a long-term memory of who you are and what you care about." },
            { icon: Mic, title: "Speaks Naturally", desc: "Converses with warmth and emotional intelligence." },
            { icon: ImageIcon, title: "Understands Images", desc: "Share your world, and Yashñ will see it with you." },
            { icon: Heart, title: "Built for Companionship", desc: "Designed for connection, not just productivity." },
            { icon: Globe, title: "Works Anywhere", desc: "Always by your side, on any device." },
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              className="glass-panel feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, delay: idx * 0.15 }}
            >
              <feature.icon className="feature-icon" size={32} />
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Yashñ Exists */}
      <section className="landing-section purpose-section">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 2 }}
        >
          <h2 className="purpose-title">Most AI answers questions.</h2>
          <h2 className="purpose-title highlight">Yashñ builds a relationship.</h2>
        </motion.div>
      </section>

      {/* Final Hero */}
      <section className="landing-section final-section">
        <motion.button 
          className="meet-btn"
          onClick={onMeetClick}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(212, 175, 120, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          Meet Yashñ
        </motion.button>
      </section>
    </div>
  );
}
