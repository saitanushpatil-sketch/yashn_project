import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import IntroAnimation from './components/IntroAnimation';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Cursor from './components/Cursor';
import AudioEngine from './components/AudioEngine';
import Sidebar from './components/Sidebar';
import { sendMessage } from './lib/aiProvider';
import { saveConversation, loadConversation, clearConversation } from './lib/storage';
import { Menu, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { onAuthStateChanged, isSignInWithEmailLink } from 'firebase/auth';
import './App.css';

function App() {
  const [appState, setAppState] = useState('LOADING'); // LOADING | LANDING | INTRO | AUTH | CHAT
  const [user, setUser] = useState(null);
  
  const [messages, setMessages] = useState(loadConversation);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const audioEngineRef = useRef(null);

  // Authentication & Initial Routing
  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      // Firebase not configured, default to landing page
      setAppState('LANDING');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // If we are just verifying an email link, go straight to AUTH
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setAppState('AUTH');
        return;
      }

      // If we are logged in, go to CHAT directly, else LANDING
      if (currentUser) {
        setAppState('CHAT');
      } else {
        setAppState('LANDING');
      }
    });

    return () => unsubscribe();
  }, []);

  // Manage Audio based on App State
  useEffect(() => {
    if (audioEngineRef.current) {
      if (appState === 'LANDING') {
        audioEngineRef.current.startAmbience?.(); // Ensure it plays on mount if user interacted
      } else if (appState === 'AUTH' || appState === 'CHAT') {
        audioEngineRef.current.stopAmbience();
      }
    }
  }, [appState]);

  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  const handleSend = async (content) => {
    const userMessage = { role: 'user', content };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await sendMessage(newHistory);
      setMessages([...newHistory, { role: 'assistant', content: response }]);
      if (audioEngineRef.current) audioEngineRef.current.playClick();
    } catch (e) {
      setMessages([...newHistory, { 
        role: 'assistant', 
        content: "I'm having trouble finding the words right now — give me a moment and try again?"
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  const handleClear = () => {
    if (messages.length === 0) return;
    if (window.confirm("Start a fresh conversation? This can't be undone.")) {
      clearConversation();
      setMessages([]);
      if (audioEngineRef.current) audioEngineRef.current.playClick();
    }
  }

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
    if (audioEngineRef.current) audioEngineRef.current.playClick();
  }, []);

  const handleMeetClick = () => {
    setAppState('INTRO');
    if (audioEngineRef.current) {
      // Browsers require interaction to play audio, this is the perfect time
      audioEngineRef.current.toggleAmbience(); 
    }
  };

  const handleIntroComplete = () => {
    // If somehow they are logged in during intro, go to CHAT, else AUTH
    setAppState(user ? 'CHAT' : 'AUTH');
  };

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    setAppState('CHAT');
  };

  if (appState === 'LOADING') {
    return <div className="app-wrapper" style={{ backgroundColor: '#050505' }}></div>;
  }

  return (
    <>
      <Cursor />
      <AudioEngine ref={audioEngineRef} />
      
      <div className="app-wrapper">
        {/* Animated Cinematic Background - Only visible in CHAT (or specific views) */}
        <AnimatePresence>
          {appState === 'CHAT' && (
            <motion.div 
              className="cinematic-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            >
              <div className="bg-orb orb-top-right"></div>
              <div className="bg-orb orb-bottom-left"></div>
              <div className="fog-layer"></div>
              <div className="vignette"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {appState === 'LANDING' && (
            <motion.div key="landing" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <LandingPage onMeetClick={handleMeetClick} />
            </motion.div>
          )}

          {appState === 'INTRO' && (
            <motion.div key="intro">
              <IntroAnimation 
                onComplete={handleIntroComplete} 
                audioRef={audioEngineRef}
              />
            </motion.div>
          )}

          {appState === 'AUTH' && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <Auth onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          )}

          {appState === 'CHAT' && (
            <motion.div 
              key="chat" 
              className="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }} // Slow fade into chat
            >
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
              
              <header className="chat-header">
                <button className="icon-btn" onClick={toggleSidebar} aria-label="Menu">
                  <Menu size={24} />
                </button>
                
                <motion.div 
                  className="header-title"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 1 }}
                >
                  Yashñ
                </motion.div>
                
                <div className="header-actions">
                  <button 
                    className="icon-btn" 
                    onClick={handleClear} 
                    aria-label="Start fresh" 
                    title="Start fresh"
                    disabled={messages.length === 0}
                    style={{ opacity: messages.length === 0 ? 0.3 : 0.7 }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </header>

              <ChatWindow messages={messages} isTyping={isTyping} />
              <MessageInput onSend={handleSend} disabled={isTyping} audioEngineRef={audioEngineRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default App
