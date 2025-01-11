import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle } from 'lucide-react';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const wsRef = useRef(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (!isJoined) return;
    
    wsRef.current = new WebSocket('ws://localhost:8080/ws');
    
    wsRef.current.onopen = () => {
      setConnected(true);
      console.log('Connected to WebSocket');
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    wsRef.current.onclose = () => {
      setConnected(false);
      console.log('Disconnected from WebSocket');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isJoined]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !connected) return;

    const messageData = {
      type: 'message',
      username: username,
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    wsRef.current.send(JSON.stringify(messageData));
    setInputMessage('');
  };

  const handleJoinChat = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsJoined(true);
  };

  if (!isJoined) {
    return (
      <div className="join-card">
        <div className="card-header">
          <h2>Join Chat</h2>
        </div>
        <div className="card-content">
          <form onSubmit={handleJoinChat}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="button">
              Join
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-card">
      <div className="card-header">
        <h2>Chat Room</h2>
        <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="card-content">
        <div className="message-area" ref={scrollAreaRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.username === username ? 'own-message' : 'other-message'}`}
            >
              <div className="message-avatar">
                <UserCircle />
              </div>
              <div className="message-content">
                <div className="message-username">{msg.username}</div>
                <div className="message-text">{msg.content}</div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!connected}
            className="input-field"
          />
          <button type="submit" disabled={!connected} className="send-button">
            <Send />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;