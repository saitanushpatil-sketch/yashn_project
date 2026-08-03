import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

export default function MessageInput({ onSend, disabled, audioEngineRef }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      if (audioEngineRef?.current) {
        audioEngineRef.current.playMessage();
      }
      onSend(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="input-area-wrapper">
      <motion.div 
        className="glass-panel"
        animate={{
          boxShadow: isFocused 
            ? '0 0 30px rgba(212, 175, 120, 0.15)' 
            : '0 0 10px rgba(0,0,0,0.1)',
          borderColor: isFocused 
            ? 'rgba(212, 175, 120, 0.3)' 
            : 'var(--glass-border)'
        }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          padding: '12px 16px',
          gap: '12px',
          position: 'relative',
        }}
      >
        <AnimatePresence>
          {!text && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                left: '28px',
                top: '22px', // Centered roughly for 1 line
                pointerEvents: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.5px'
              }}
            >
              Message Yashñ...
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            lineHeight: '1.5',
            resize: 'none',
            padding: '8px 12px',
            maxHeight: '120px',
            cursor: 'none' // For custom cursor
          }}
        />
        
        <motion.button 
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          whileHover={(!disabled && text.trim()) ? { scale: 1.1, backgroundColor: 'rgba(212, 175, 120, 0.2)' } : {}}
          whileTap={(!disabled && text.trim()) ? { scale: 0.95 } : {}}
          style={{
            background: text.trim() ? 'rgba(212, 175, 120, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: text.trim() ? 'var(--gold-secondary)' : 'transparent',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: text.trim() ? 'var(--gold-primary)' : 'var(--text-tertiary)',
            cursor: 'none',
            flexShrink: 0,
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.3s ease'
          }}
          aria-label="Send"
        >
          <Send size={20} style={{ marginLeft: '-2px', marginTop: '2px' }} />
        </motion.button>
      </motion.div>
    </div>
  );
}
