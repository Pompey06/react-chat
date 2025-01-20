import React from 'react';
import './Header.css';
import burgerBlue from '../../assets/burger-blue.svg';
import { useTranslation } from 'react-i18next';

const Header = ({ isSidebarOpen, toggleSidebar }) => {

   const { i18n } = useTranslation(); // Хук для перевода
   
  const [language, setLanguage] = React.useState('русc'); // Текущий язык

  const handleLanguageChange = (lang) => {
   i18n.changeLanguage(lang);
   setLanguage(lang);
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