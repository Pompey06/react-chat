import React from 'react';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';
import './ChatWindow.css';

export default function ChatWindow({ isSidebarOpen, toggleSidebar }) {
  return (
    <div className="chat-window flex flex-col h-full">
      <MessageList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <MessageInput />
    </div>
  );
}