import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setConversation(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };
      setConversation(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5));
            if (data.text) {
              assistantMessage.content += data.text;
              setConversation(prev => [
                ...prev.slice(0, -1),
                { ...assistantMessage }
              ]);
            }
            if (data.done) {
              setLoading(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: 'assistant', content: 'Error communicating with Ollama: ' + error.message };
      setConversation(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-1 overflow-auto p-4">
        {conversation.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-700 text-white border border-gray-600 p-2 mr-2 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter your message..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}