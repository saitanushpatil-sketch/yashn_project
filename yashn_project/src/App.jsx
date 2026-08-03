import { useState, useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import IntroAnimation from './components/IntroAnimation'
import { sendMessage } from './lib/aiProvider'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('yashn_intro_played') === 'true'
    if (!hasPlayed) {
      setShowIntro(true)
    }
  }, [])

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

  return (
    <div className="app-container">
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <ChatWindow messages={messages} isTyping={isTyping} />
      <MessageInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}

export default App
