import React from 'react';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';
import './ChatWindow.css'

export default function ChatWindow() {
  

  return (
    <div className="chat-window flex flex-col h-full">
      {/* Список сообщений */}
      <MessageList />

      {/* Поле ввода */}
      <MessageInput />
    </div>
  );
}