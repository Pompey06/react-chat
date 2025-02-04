import React from 'react';
import './Header.css';
import burgerBlue from '../../assets/burger-blue.svg';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext'; // Путь к ChatProvider

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const { i18n } = useTranslation(); // Хук для перевода
  const { updateLocale } = useContext(ChatContext); // Получаем функцию из контекста

  const [language, setLanguage] = React.useState('русc'); // Текущий язык

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    updateLocale(lang); // Вызываем функцию для обновления языка
  };

  return (
    <div className="h-[83px] justify-end header border-b-1 border-solid flex items-center px-4">
      {/* Иконка открытия боковой панели для мобильных устройств */}
      <img
        src={burgerBlue}
        alt="Menu"
        className={`header__burger-icon ${isSidebarOpen ? 'hidden' : 'block'} md:hidden`}
        onClick={toggleSidebar} // Вызываем toggleSidebar при клике
      />
      <div className="flex language">
        <button
          className={`language__button rounded ${
            language === 'русc' ? 'bg-blue text-white' : 'bg-gray color-blue'
          }`}
          onClick={() => handleLanguageChange('русc')}
        >
          русc
        </button>
        <button
          className={`language__button rounded ${
            language === 'қаз' ? 'bg-blue text-white' : 'bg-gray color-blue'
          }`}
          onClick={() => handleLanguageChange('қаз')}
        >
          қаз
        </button>
      </div>
    </div>
  );
};

export default Header;