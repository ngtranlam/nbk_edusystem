import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import { sendMessage } from '../services/geminiService';
import Icon from './Icon';
import './ChatBox.css';

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của trường THCS Nguyễn Bỉnh Khiêm. Tôi đã đọc xong dữ liệu 496 học sinh, 36 giáo viên, điểm số 14 lớp và kế hoạch tuần.\n\nHãy hỏi tôi về điểm số, chuyên cần, học sinh cá biệt hoặc kế hoạch tuần.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { label: 'Học sinh vắng nhiều nhất?', icon: 'alert' },
    { label: 'Học sinh điểm thấp nhất?', icon: 'barChart' },
    { label: 'Tổng quan trường', icon: 'fileText' },
    { label: 'Danh sách GVCN', icon: 'trophy' },
    { label: 'Kế hoạch tuần này', icon: 'clipboard' },
  ];

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const userText = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await sendMessage(userText);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Lỗi: ${error?.message || 'Không thể kết nối AI. Vui lòng thử lại.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <div className="chatbox-header-left">
          <div className="ai-avatar">
            <span className="ai-avatar-icon"><Icon name="sparkles" size={20} /></span>
            <span className="ai-avatar-pulse"></span>
          </div>
          <div className="ai-header-info">
            <h3>Trợ lý AI</h3>
            <span className="ai-status-text">
              <span className="ai-status-dot"></span>
              Đang hoạt động
            </span>
          </div>
        </div>
        <button className="chatbox-menu-btn"><Icon name="settings" size={18} /></button>
      </div>

      <div className="chatbox-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar"><Icon name="sparkles" size={16} /></div>
            )}
            <div className="message-bubble">
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))
                )}
              </div>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message assistant">
            <div className="message-avatar"><Icon name="sparkles" size={16} /></div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chatbox-footer">
        <div className="quick-prompts">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              className="quick-prompt-btn"
              onClick={() => handleQuickPrompt(prompt.label)}
            >
              <span className="qp-icon"><Icon name={prompt.icon} size={14} /></span>
              {prompt.label}
            </button>
          ))}
        </div>
        <div className="input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Hỏi về lớp 8A..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <Icon name="send" size={18} />
          </button>
        </div>
        <div className="input-hint">Enter: gửi  |  Shift+Enter: xuống dòng</div>
      </div>
    </div>
  );
};

export default ChatBox;
