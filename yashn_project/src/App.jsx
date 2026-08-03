import { useState, useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import IntroAnimation from './components/IntroAnimation'
import { sendMessage } from './lib/aiProvider'
import { saveConversation, loadConversation, clearConversation } from './lib/storage'
import './App.css'

function App() {
  const [messages, setMessages] = useState(loadConversation)
  const [isTyping, setIsTyping] = useState(false)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('yashn_intro_played') === 'true'
    if (!hasPlayed) {
      setShowIntro(true)
    }
  }, [])

  useEffect(() => {
    saveConversation(messages)
  }, [messages])

  const handleSend = async (content) => {
    const userMessage = { role: 'user', content };
    const newHistory = [...messages, userMessage];
    
    // Optimistic update
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await sendMessage(newHistory);
      setMessages([...newHistory, { role: 'assistant', content: response }]);
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
    if (window.confirm("Start a fresh conversation? This can't be undone.")) {
      clearConversation();
      setMessages([]);
    }
  }

  return (
    <div className="app-container">
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <header className="chat-header">
        <div className="header-title">Yashñ</div>
        <button className="clear-btn" onClick={handleClear} aria-label="Start fresh" title="Start fresh">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </header>
      <ChatWindow messages={messages} isTyping={isTyping} />
      <MessageInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}

export default App
