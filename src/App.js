import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle API call to OpenRouter
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
  
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
  
    try {
      const response = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openchat/openchat-7b',
          messages: newMessages
        })
      });
  
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      setMessages([...newMessages, data.choices[0].message]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: '🚨 Error: Failed to get response. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>OpenRouter Chatbot</h1>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
          {loading && <div className="message assistant">Thinking...</div>}
        </div>
        <form onSubmit={sendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
      <div className="disclaimer">
        <small>Free public demo. Chat history is not saved.</small>
      </div>
    </div>
  );
};

export default App;