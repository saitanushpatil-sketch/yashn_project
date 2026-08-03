import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Clock, Music, Mic, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { icon: Clock, label: 'Recent Memories' },
    { icon: Mic, label: 'Voice Settings' },
    { icon: Music, label: 'Audio & Ambience' },
    { icon: Settings, label: 'Preferences' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(5, 5, 5, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 90
            }}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '320px',
              backgroundColor: 'rgba(13, 11, 8, 0.85)', // var(--bg-tertiary)
              backdropFilter: 'blur(30px)',
              borderRight: '1px solid var(--glass-border)',
              zIndex: 100,
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '20px 0 40px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '1px' }}>Yashñ</h2>
              <button className="icon-btn" onClick={onClose} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  whileHover={{ x: 8, backgroundColor: 'var(--glass-bg)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.1rem',
                    cursor: 'none',
                    textAlign: 'left',
                    transition: 'border-color 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <item.icon size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 300 }}>{item.label}</span>
                </motion.button>
              ))}
            </div>

            <div style={{
              marginTop: 'auto',
              padding: '24px 0 0',
              borderTop: '1px solid var(--glass-border)',
              color: 'var(--text-tertiary)',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              v2.0 Cinematic Edition
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
