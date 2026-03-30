import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ChatBox from './components/ChatBox';
import { DataProvider } from './contexts/DataContext';
import { defaultPeriodKey } from './data/realData';
import './App.css';

const MIN_CHAT_WIDTH = 340;
const MAX_CHAT_WIDTH = 800;
const DEFAULT_CHAT_WIDTH = 380;

function App() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [periodKey, setPeriodKey] = useState<string>(defaultPeriodKey);
  const [chatWidth, setChatWidth] = useState<number>(DEFAULT_CHAT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = chatWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [chatWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(MAX_CHAT_WIDTH, Math.max(MIN_CHAT_WIDTH, startWidth.current + delta));
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Determine dashboard layout mode based on remaining space
  const isCompact = chatWidth > 500;

  return (
    <DataProvider>
      <div className="app">
        <Header />
        <div className="app-content">
          <div className={`dashboard-panel ${isCompact ? 'compact' : ''}`}>
            <Dashboard selectedClass={selectedClass} onClassChange={setSelectedClass} periodKey={periodKey} onPeriodChange={setPeriodKey} />
          </div>
          <div
            className="resize-handle"
            onMouseDown={handleMouseDown}
          >
            <div className="resize-handle-line" />
          </div>
          <div className="chat-panel" style={{ width: chatWidth }}>
            <ChatBox />
          </div>
        </div>
      </div>
    </DataProvider>
  );
}

export default App;
