import React, { useContext, useEffect, useRef, useState } from 'react';
import Message from '../Message/Message';
import FeedbackMessage from '../FeeadbackMessage/FeedbackMessage';
import Header from '../../Header/Header';
import Sidebar from '../../Sidebar/Sidebar';
import { useTranslation } from 'react-i18next'; // Импортируем хук для перевода
import { ChatContext } from '../../../context/ChatContext';

export default function MessageList({ isSidebarOpen, toggleSidebar }) {
  const { t } = useTranslation(); // Инициализируем хук для перевода

  // Список сообщений с использованием ключей для перевода


   const {messages} = useContext(ChatContext);


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
         {messages.length ? (
messages.map((message, index) =>
   message.isFeedback ? (
     <FeedbackMessage key={index} text={message.text} />
   ) : (
     <Message key={index} text={message.text} isUser={message.isUser} />
   )
 )
         ) : ''}
        
        <div ref={scrollTargetRef}></div>
      </div>
    </div>
  );
}