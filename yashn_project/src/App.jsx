import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import { sendMessage } from './lib/aiProvider'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

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
      <ChatWindow messages={messages} isTyping={isTyping} />
      <MessageInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}

export default App
