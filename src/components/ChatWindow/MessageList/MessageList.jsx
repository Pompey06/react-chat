import React, { useContext, useEffect, useRef, useState } from 'react';
import Message from '../Message/Message';
import FeedbackMessage from '../FeeadbackMessage/FeedbackMessage';
import Header from '../../Header/Header';
import Sidebar from '../../Sidebar/Sidebar';
import { useTranslation } from 'react-i18next';
import { ChatContext } from '../../../context/ChatContext';
import './MessageList.css';
import TypingIndicator from '../TypingIndicator/TypingIndicator';

export default function MessageList({ isSidebarOpen, toggleSidebar }) {
  const { t } = useTranslation();
  const { chats, currentChatId, getBotMessageIndex, isTyping, handleButtonClick, showInitialButtons } =
    useContext(ChatContext);

  // Изменяем логику поиска текущего чата
  const currentChat = chats.find((c) => 
    (currentChatId === null && c.id === null) || c.id === currentChatId
  );
  

  // Получаем сообщения с проверкой
  const messages = currentChat?.messages || [];



  const scrollTargetRef = useRef(null);

  useEffect(() => {
    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {windowWidth < 700 && (
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      <div className='overflow-y-auto message-list-wrap'>
        <div className="message-list justify-end flex flex-col">
          {messages.map((message, index) => {
            const isFirstMessage = index === 0;
            const botMessageIndex = getBotMessageIndex(index);


            return (
              <React.Fragment key={index}>
                {message.isFeedback ? (
                  <FeedbackMessage 
                    text={message.text} 
                    messageIndex={botMessageIndex}
                  />
                ) : (
                  <Message
                    text={message.text}
                    isUser={message.isUser}
                    messageIndex={botMessageIndex}
                    isButton={showInitialButtons && message.isButton}
                    onClick={() => handleButtonClick(message.text)}
                    filePath={message.filePath}
                  />
                )}

                {isFirstMessage && showInitialButtons && (
                  <div className="suggestion-text mt-4">
                    {t('chat.suggestionText')}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {isTyping && <TypingIndicator text={t('chatTyping.typingMessage')} />}
          <div ref={scrollTargetRef}></div>
        </div>
      </div>
    </div>
  );
}