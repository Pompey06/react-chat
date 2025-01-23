import React, { useContext, useState } from 'react';
import './MessageInput.css';
import sendIcon from '../../../assets/send.svg';
import { useTranslation } from 'react-i18next'; // Импортируем хук для перевода
import { ChatContext } from '../../../context/ChatContext';

export default function MessageInput() {
  const { t } = useTranslation(); // Инициализируем хук для перевода
  const [message, setMessage] = useState('');

  const {createMessage} = useContext(ChatContext)


  

  const handleSend = async () => {

   createMessage(message);
    console.log(t('messageInput.sentMessage'), message); // Логируем перевод строки "Отправлено сообщение"
    setMessage(''); // Очистить поле ввода
  };

  return (
    <div className="message-input mt-auto font-light bg-white flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('messageInput.placeholder')} // Перевод строки "Отправить сообщение..."
        className="flex-1 p-2 border rounded-lg"
      />
      <button onClick={handleSend} className="">
        <img src={sendIcon} alt={t('messageInput.sendIconAlt')} /> {/* Перевод строки "Иконка отправки" */}
      </button>
    </div>
  );
}