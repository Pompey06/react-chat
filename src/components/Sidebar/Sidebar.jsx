import './Sidebar.css';
import React, { useState, useEffect } from 'react';
import burger from '../../assets/burger.svg';
import newChat from '../../assets/new.svg';
import previousChat from '../../assets/previous.svg';

import SidebarButton from '../SidebarButton/SidebarButton';
import { useTranslation } from 'react-i18next'; // Импортируем хук для перевода

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { t } = useTranslation(); // Инициализируем хук для перевода
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
    // Логика для создания нового чата
  };

  const handlePreviousRequest = () => {
    // Логика для обработки предыдущего запроса
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
        alt={t('sidebar.close')} // Перевод строки "Закрыть боковую панель"
      />
      {/* Условие отображения кнопок */}
      {(isMobile ? isSidebarOpen : !isSidebarOpen) && ( // Логика для мобильных и компьютеров
        <div className="sidebar__buttons flex justify-start flex-col gap-2.5 mt-16">
          <SidebarButton
            text={t('sidebar.newChat')} // Перевод строки "Новый чат"
            icon={<img src={newChat} alt={t('sidebar.newChat')} className="w-5 h-5" />}
            onClick={handleNewChat}
          />
          <SidebarButton
            text={t('sidebar.previousRequest')} // Перевод строки "Прошлый запрос"
            icon={<img src={previousChat} alt={t('sidebar.previousRequest')} className="w-5 h-5" />}
            onClick={handlePreviousRequest}
          />
         <SidebarButton
            text={t('sidebar.previousRequest')} // Перевод строки "Прошлый запрос"
            icon={<img src={previousChat} alt={t('sidebar.previousRequest')} className="w-5 h-5" />}
            onClick={handlePreviousRequest}
          />
        </div>
      )}
    </div>
  );
}