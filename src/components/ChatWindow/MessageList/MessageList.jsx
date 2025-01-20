import React, { useEffect, useRef, useState } from 'react';
import Message from '../Message/Message';
import FeedbackMessage from '../FeeadbackMessage/FeedbackMessage';
import Header from '../../Header/Header';
import Sidebar from '../../Sidebar/Sidebar';
import { useTranslation } from 'react-i18next'; // Импортируем хук для перевода

export default function MessageList({ isSidebarOpen, toggleSidebar }) {
  const { t } = useTranslation(); // Инициализируем хук для перевода

  // Список сообщений с использованием ключей для перевода
  const messages = [
    { id: 1, text: t('messages.userMessage1'), isUser: true },
    { id: 2, text: t('messages.botMessage1'), isUser: false },
    { id: 3, text: t('messages.userMessage2'), isUser: true },
    { id: 4, text: t('messages.botMessage2'), isUser: false },
    { id: 5, text: t('messages.feedbackPrompt'), isUser: false, isFeedback: true },
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