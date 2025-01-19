import React, { useState } from 'react';
import './MessageInput.css'
import sendIcon from '../../../assets/send.svg'

export default function MessageInput() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    console.log('Отправлено сообщение:', message);
    setMessage(''); // Очистить поле ввода
  };

  return (
    <div className="message-input mt-auto	 font-light bg-white flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Отправить сообщение..."
        className="flex-1 p-2 border rounded-lg"
      />
      <button
        onClick={handleSend}
        className=""
      >
        <img src={sendIcon} alt="send-icon" />
      </button>
    </div>
  );
}