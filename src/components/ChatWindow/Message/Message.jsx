import React from 'react';
import './Message.css';

export default function Message({ text, isUser, isButton, onClick }) {
  return (
    <div
      className={`message mb-8 bg-white flex font-light ${
        isUser
          ? 'user text-right self-end text-white'
          : 'text-left ai text-black self-start'
      } ${isButton ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''}`}
      onClick={isButton ? onClick : undefined}
    >
      {text}
    </div>
  );
}