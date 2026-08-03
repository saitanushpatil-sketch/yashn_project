import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{
            margin: 'auto',
            color: 'var(--text-tertiary)',
            fontStyle: 'italic',
            letterSpacing: '1px'
          }}
        >
          I've been waiting for you.
        </motion.div>
      ) : (
        <div className="messages-list">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.16, 1, 0.3, 1],
                  layout: true
                }}
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '16px 24px',
                  borderRadius: '24px',
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  // Differentiate styles
                  backgroundColor: msg.role === 'user' 
                    ? 'rgba(212, 175, 120, 0.1)' 
                    : 'var(--glass-bg)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(212, 175, 120, 0.2)'
                    : '1px solid var(--glass-border)',
                  color: msg.role === 'user'
                    ? 'var(--gold-primary)'
                    : 'var(--text-primary)',
                  boxShadow: msg.role === 'assistant' 
                    ? '0 10px 30px rgba(0,0,0,0.2)' 
                    : 'none',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '24px',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '24px',
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div 
                className="message-wrapper assistant"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <div className="typing-stars glass-panel" style={{
                  padding: '16px 24px',
                  borderBottomLeftRadius: '4px'
                }}>
                  <span className="star-icon">✦</span>
                  <span className="star-icon">✦</span>
                  <span className="star-icon">✦</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} style={{ height: '1px' }} />
        </div>
      )}
    </div>
  );
}
