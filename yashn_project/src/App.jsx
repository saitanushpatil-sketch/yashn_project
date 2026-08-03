import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import IntroAnimation from './components/IntroAnimation';
import Cursor from './components/Cursor';
import AudioEngine from './components/AudioEngine';
import Sidebar from './components/Sidebar';
import { sendMessage } from './lib/aiProvider';
import { saveConversation, loadConversation, clearConversation } from './lib/storage';
import { Menu, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import './App.css';

function App() {
  const [messages, setMessages] = useState(loadConversation);
  const [isTyping, setIsTyping] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const audioEngineRef = useRef(null);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('yashn_intro_played') === 'true';
    if (!hasPlayed) {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  const handleSend = async (content) => {
    const userMessage = { role: 'user', content };
    const newHistory = [...messages, userMessage];
    
    // Optimistic update
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await sendMessage(newHistory);
      setMessages([...newHistory, { role: 'assistant', content: response }]);
      
      // Play received sound effect
      if (audioEngineRef.current) {
        audioEngineRef.current.playClick();
      }
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
    // Only ask for confirmation if there are messages
    if (messages.length === 0) return;
    
    if (window.confirm("Start a fresh conversation? This can't be undone.")) {
      clearConversation();
      setMessages([]);
      if (audioEngineRef.current) {
        audioEngineRef.current.playClick();
      }
    }
  }

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
    if (audioEngineRef.current) {
      audioEngineRef.current.playClick();
    }
  }, []);

  return (
    <>
      <Cursor />
      <AudioEngine ref={audioEngineRef} />
      
      <div className="app-wrapper">
        {/* Animated Cinematic Background */}
        <div className="cinematic-bg">
          <div className="bg-orb orb-top-right"></div>
          <div className="bg-orb orb-bottom-left"></div>
          <div className="fog-layer"></div>
          <div className="vignette"></div>
        </div>

        {showIntro ? (
          <IntroAnimation 
            onComplete={() => setShowIntro(false)} 
            audioRef={audioEngineRef}
          />
        ) : (
          <>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <div className="main-content">
              <header className="chat-header">
                <button className="icon-btn" onClick={toggleSidebar} aria-label="Menu">
                  <Menu size={24} />
                </button>
                
                <motion.div 
                  className="header-title"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
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
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default App
