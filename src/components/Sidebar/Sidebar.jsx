// Sidebar.jsx
import './Sidebar.css';
import React, { useState, useEffect, useContext } from 'react';
import burger from '../../assets/burger.svg';
import newChat from '../../assets/new.svg';
import previousChat from '../../assets/previous.svg';

import SidebarButton from '../SidebarButton/SidebarButton';
import { useTranslation } from 'react-i18next';
import { ChatContext } from '../../context/ChatContext';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const { chats, currentChatId, createNewChat, switchChat } = useContext(ChatContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = () => {
    createNewChat();
  };

  return (
    <div
      className={`sidebar flex xl:p-8 flex-col ${
        isSidebarOpen
          ? 'sidebar--open p-8 bg-blue'
          : 'xl:min-w-96 p-3 py-[32px] min-w-[248px] bg-blue'
      }`}
    >
      <img
        onClick={toggleSidebar}
        src={burger}
        className="sidebar__icon self-end cursor-pointer"
        alt={t('sidebar.close')}
      />

      {(isMobile ? isSidebarOpen : !isSidebarOpen) && (
        <div className="sidebar__buttons flex justify-start flex-col gap-2.5 mt-16">
          {/* Кнопка "Новый чат" */}
          <SidebarButton
            text={t('sidebar.newChat')}
            icon={<img src={newChat} alt={t('sidebar.newChat')} className="w-5 h-5" />}
            onClick={handleNewChat}
          />

          {/* Перебираем все чаты (включая текущий). 
              Для каждого выводим: "Прошлый чат 1", "Прошлый чат 2" и т.д. */}
          {chats.map((chat, index) => {
            console.log('В рендере чата:', { 
               chatId: chat.id, 
               currentChatId, 
               isEqual: chat.id === currentChatId 
             });
  const chatNumber = index + 1;
  const isActive = chat.id === currentChatId;

  return (
    <SidebarButton
      key={chat.id}
      text={`Прошлый чат ${chatNumber}`}
      icon={
        <img
          src={previousChat}
          alt={t('sidebar.previousRequest')}
          className="w-5 h-5"
        />
      }
      // Передадим класс, где при isActive даём заливку 
      // (например, светлым цветом фона Tailwind)
      className={`py-2 px-4 rounded-md ${
        isActive ? 'bg-gray-200' : 'bg-white'
      }`}
      onClick={() => switchChat(chat.id)}
    />
  );
})}
        </div>
      )}
    </div>
  );
}