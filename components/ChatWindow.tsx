import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Icon } from './Icon';

interface ChatWindowProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isSendingMessage: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
    </div>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ history, onSendMessage, isSendingMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSendingMessage) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleSuggestionClick = (question: string) => {
      if (!isSendingMessage) {
          onSendMessage(question);
      }
  }

  return (
    <div className="flex flex-col h-full max-h-[45vh] p-4">
      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className="flex flex-col">
            <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'model' && 
                <span className="flex-shrink-0 text-brand-accent pt-1.5">
                  <Icon id="robot" className="w-6 h-6" />
                </span>
              }
              <div
                className={`max-w-xl rounded-xl px-4 py-2.5 whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-brand-accent text-brand-primary font-medium'
                    : 'bg-slate-700 text-brand-text'
                }`}
              >
                {msg.text === '...' ? <TypingIndicator /> : msg.text}
              </div>
            </div>
            {msg.sender === 'model' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 ml-9">
                    {msg.suggestedQuestions.map((q, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(q)}
                        className="text-sm bg-slate-600/50 text-brand-accent px-3 py-1 rounded-full hover:bg-slate-600 transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
          disabled={isSendingMessage}
        />
        <button
          type="submit"
          disabled={isSendingMessage || !input.trim()}
          className="bg-brand-accent hover:bg-brand-accent-dark disabled:bg-slate-600 disabled:cursor-not-allowed text-brand-primary font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
};
