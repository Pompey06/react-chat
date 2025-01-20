import './Sidebar.css';
import React, { useState, useEffect } from 'react';
import burger from '../../assets/burger.svg';
import newChat from '../../assets/new.svg';
import previousChat from '../../assets/previous.svg';

import SidebarButton from '../SidebarButton/SidebarButton';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Обновляем состояние isMobile при изменении ширины окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNewChat = () => {
    // Логика для нового чата
  };

  const handlePreviousRequest = () => {
    // Логика для предыдущего запроса
  };

  return (
    <div
      className={`sidebar flex xl:p-8 flex-col ${
        isSidebarOpen
          ? 'sidebar--open p-8 bg-blue' // Стили для открытой боковой панели
          : 'xl:min-w-96 p-3 py-[32px] min-w-[248px] bg-blue' // Стили для закрытой боковой панели
      }`}
    >
      {/* Иконка бургера */}
      <img
        onClick={toggleSidebar} // Вызываем toggleSidebar при клике
        src={burger}
        className="sidebar__icon self-end cursor-pointer"
        alt="Close Sidebar"
      />
      {/* Условие отображения кнопок */}
      {(isMobile ? isSidebarOpen : !isSidebarOpen) && ( // Логика для мобильных и компьютеров
        <div className="sidebar__buttons flex justify-start flex-col gap-2.5 mt-16">
          <SidebarButton
            text="Новый чат"
            icon={<img src={newChat} alt="New Chat" className="w-5 h-5" />}
            onClick={handleNewChat}
          />
          <SidebarButton
            text="Прошлый запрос"
            icon={<img src={previousChat} alt="Previous Chat" className="w-5 h-5" />}
            onClick={handlePreviousRequest}
          />
          <SidebarButton
            text="Прошлый запрос"
            icon={<img src={previousChat} alt="Previous Chat" className="w-5 h-5" />}
            onClick={handlePreviousRequest}
          />
        </div>
      )}
    </div>
  );
}