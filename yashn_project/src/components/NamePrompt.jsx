import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './NamePrompt.css';
import { saveUserName } from '../lib/storage';

/**
 * NamePrompt — "What should I call you?"
 * Replaces Firebase Auth for the hackathon.
 * Stores name in localStorage. Skippable as Guest.
 */
export default function NamePrompt({ onComplete }) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      saveUserName(trimmed);
      setSubmitted(true);
      setTimeout(() => onComplete(trimmed), 2500);
    }
  };

  const handleGuest = () => {
    saveUserName('Guest');
    setSubmitted(true);
    setTimeout(() => onComplete('Guest'), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="name-container">
      {!submitted ? (
        <motion.div
          className="name-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <h2 className="name-question">What should I call you?</h2>

          <form onSubmit={handleSubmit} className="name-form">
            <div className="name-input-wrap">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="name-input"
                autoComplete="off"
                spellCheck="false"
              />
              <motion.div
                className="name-underline"
                animate={{
                  scaleX: name.length > 0 ? 1 : 0.3,
                  backgroundColor: name.length > 0
                    ? 'rgba(212,175,55,0.6)'
                    : 'rgba(255,255,255,0.1)',
                }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {name.trim() && (
              <motion.button
                type="submit"
                className="name-continue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(212,175,55,0.2)' }}
                whileTap={{ scale: 0.97 }}
              >
                Continue
              </motion.button>
            )}
          </form>

          <motion.button
            className="name-guest"
            onClick={handleGuest}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            Continue as Guest
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className="name-welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <p className="welcome-text">
            Welcome, <span className="welcome-name">{name.trim() || 'friend'}</span>.
          </p>
          <motion.p
            className="welcome-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5 }}
          >
            I've been waiting.
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
