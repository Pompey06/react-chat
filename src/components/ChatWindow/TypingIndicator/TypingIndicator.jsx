import React from 'react';
import './TypingIndicator.css';

export default function TypingIndicator({ text = 'Печатает' }) {
  return (
    <div className="typing-container">
      {text}
      <span className="dot one">.</span>
      <span className="dot two">.</span>
      <span className="dot three">.</span>
    </div>
  );
}