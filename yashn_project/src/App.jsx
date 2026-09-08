import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import IntroAnimation from './components/IntroAnimation';
import LandingPage from './components/LandingPage';
import NamePrompt from './components/NamePrompt';
import Cursor from './components/Cursor';
import AudioEngine from './components/AudioEngine';
import Sidebar from './components/Sidebar';
import { sendMessage } from './lib/aiProvider';
import { saveConversation, loadConversation, clearConversation } from './lib/storage';
import { Menu, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const storedName = localStorage.getItem('yashn_username');
  const [appState, setAppState] = useState('LANDING');
  const [userName, setUserName] = useState(storedName || null);

  const [messages, setMessages] = useState(loadConversation);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (appState === 'CHAT') {
      audioRef.current.transitionTo?.('chat');
    }
  }, [appState]);

  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  const handleFirstInteraction = useCallback(() => {
    if (!hasInteracted && appState === 'LANDING') {
      setHasInteracted(true);
      if (audioRef.current?.startAmbience) {
        audioRef.current.startAmbience('landing');
      }
    }
  }, [hasInteracted, appState]);

  const handleSend = async (content) => {
    const userMessage = { role: 'user', content };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await sendMessage(newHistory);
      setMessages([...newHistory, { role: 'assistant', content: response }]);
    } catch {
      setMessages([...newHistory, {
        role: 'assistant',
        content: "I'm having trouble finding the words right now — give me a moment and try again?"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    if (messages.length === 0) return;
    if (window.confirm("Start a fresh conversation? This can't be undone.")) {
      clearConversation();
      setMessages([]);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleEnter = () => {
    // If they haven't interacted yet, this is their first interaction
    handleFirstInteraction();
    
    setAppState('INTRO');
    if (audioRef.current?.transitionTo) {
      audioRef.current.transitionTo('intro');
    }
  };

  const handleIntroComplete = () => {
    if (userName && userName !== 'Guest') {
      setAppState('CHAT');
    } else {
      setAppState('NAME');
    }
  };

  const handleNameComplete = (name) => {
    setUserName(name);
    setAppState('CHAT');
  };

  return (
    <div onClick={handleFirstInteraction} onKeyDown={handleFirstInteraction} tabIndex="0" style={{ outline: 'none' }}>
      <Cursor />
      <AudioEngine ref={audioRef} />

      <div className="app-wrapper">
        <AnimatePresence>
          {appState === 'CHAT' && (
            <motion.div
              className="chat-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3 }}
            >
              <div className="bg-orb orb-1" />
              <div className="bg-orb orb-2" />
              <div className="bg-aurora" />
              <div className="bg-vignette" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {appState === 'LANDING' && (
            <motion.div key="landing" exit={{ opacity: 0 }} transition={{ duration: 1.5 }}>
              <LandingPage onEnter={handleEnter} />
            </motion.div>
          )}

          {appState === 'INTRO' && (
            <motion.div key="intro">
              <IntroAnimation
                onComplete={handleIntroComplete}
                audioRef={audioRef}
              />
            </motion.div>
          )}

          {appState === 'NAME' && (
            <motion.div
              key="name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              <NamePrompt onComplete={handleNameComplete} />
            </motion.div>
          )}

          {appState === 'CHAT' && (
            <motion.div
              key="chat"
              className="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
            >
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

              <header className="chat-header">
                <button className="icon-btn" onClick={toggleSidebar} aria-label="Menu">
                  <Menu size={20} />
                </button>

                <motion.div
                  className="header-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.8 }}
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
                    style={{ opacity: messages.length === 0 ? 0.15 : 0.5 }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </header>

              <ChatWindow
                messages={messages}
                isTyping={isTyping}
                userName={userName}
              />
              <MessageInput
                onSend={handleSend}
                disabled={isTyping}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
