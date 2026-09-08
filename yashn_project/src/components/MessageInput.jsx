import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const taRef = useRef(null);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const send = () => {
    const t = text.trim();
    if (t && !disabled) {
      onSend(t);
      setText('');
      if (taRef.current) taRef.current.style.height = 'auto';
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="input-wrap">
      <motion.div
        className="input-bar"
        animate={{
          borderColor: focused
            ? 'rgba(212,175,55,0.35)'
            : 'rgba(212,175,55,0.08)',
          boxShadow: focused
            ? '0 0 30px rgba(212,175,55,0.1), inset 0 1px 0 rgba(212,175,55,0.05)'
            : '0 0 0 transparent',
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow line at top of bar */}
        <motion.div
          className="input-glow-line"
          animate={{ opacity: focused ? 1 : 0, scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        />

        <AnimatePresence>
          {!text && (
            <motion.span
              className="input-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Message Yashñ...
            </motion.span>
          )}
        </AnimatePresence>

        <textarea
          ref={taRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          rows={1}
          className="input-field"
          maxLength={4000}
          aria-label="Message Yashñ"
          placeholder=""
        />

        <motion.button
          onClick={send}
          disabled={disabled || !hasText}
          className="send-btn"
          animate={{
            opacity: hasText ? 1 : 0.3,
            scale: hasText ? 1 : 0.9,
            backgroundColor: hasText ? 'rgba(212,175,55,0.15)' : 'transparent',
            borderColor: hasText ? 'rgba(212,175,55,0.4)' : 'transparent',
          }}
          whileHover={hasText ? { scale: 1.08, boxShadow: '0 0 20px rgba(212,175,55,0.2)' } : {}}
          whileTap={hasText ? { scale: 0.95 } : {}}
          transition={{ duration: 0.3 }}
          aria-label="Send"
        >
          <Send size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}
