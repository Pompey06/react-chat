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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

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
    if (isMobile) {
      toggleSidebar(); // Закрываем боковое меню на мобильных устройствах
    }
  };

  const handleSwitchChat = (chatId) => {
    switchChat(chatId);
    if (isMobile) {
      toggleSidebar(); // Закрываем боковое меню на мобильных устройствах
    }
  };

  return (
    <div
      className={`sidebar overflow-y-auto flex xl:p-8 flex-col bg-blue ${
        isSidebarOpen
          ? 'sidebar--close p-8 '
          : 'xl:min-w-96 p-3 py-[32px] min-w-[248px]'
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
            className="bg-white"
          />

          {/* Перебираем все чаты (включая текущий). 
              Для каждого выводим: "Прошлый чат 1", "Прошлый чат 2" и т.д. */}
          {chats.map((chat, index) => {
            const chatNumber = index + 1;
            const isActive = chat.id === currentChatId;

            return (
              <SidebarButton
                key={chat.id}
                text={t('sidebar.previousChat', { number: chatNumber })}
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
                  isActive ? 'bg-gray-300 text-black' : 'bg-white text-gray-600'
                }`}
                onClick={() => handleSwitchChat(chat.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}