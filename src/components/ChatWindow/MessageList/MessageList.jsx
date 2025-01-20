import React, { useEffect, useRef, useState } from 'react';
import Message from '../Message/Message';
import FeedbackMessage from '../FeeadbackMessage/FeedbackMessage';
import Header from '../../Header/Header';
import Sidebar from '../../Sidebar/Sidebar';

export default function MessageList({ isSidebarOpen, toggleSidebar }) {
  const messages = [
    { id: 1, text: 'Мне нужно заполнить статистическую форму', isUser: true },
    { id: 2, text: 'Хорошо, давайте уточним. Какую форму вы хотите заполнить?', isUser: false },
    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },
    { id: 4, text: 'Понял вас! Если вам понадобится помощь, просто напишите. Хорошего дня!', isUser: false },
    { id: 5, text: 'Оцените качество ответа', isUser: false, isFeedback: true },
  ];

  const scrollTargetRef = useRef(null);

  useEffect(() => {
    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Custom hook to track window width
  const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowWidth;
  };

  const windowWidth = useWindowWidth();

  return (
    <div className="relative">
      {/* Передаём управление боковой панелью в Header */}
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Боковая панель */}
      {windowWidth < 700 && (
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Список сообщений */}
      <div className="message-list flex flex-col max-h-[732px] overflow-y-auto">
        {messages.map((message) =>
          message.isFeedback ? (
            <FeedbackMessage key={message.id} text={message.text} />
          ) : (
            <Message key={message.id} text={message.text} isUser={message.isUser} />
          )
        )}
        <div ref={scrollTargetRef}></div>
      </div>
    </div>
  );
}