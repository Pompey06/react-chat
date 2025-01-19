import React, { useState } from 'react';
import './Header.css'

const Header = () => {
  const [language, setLanguage] = useState('русc'); // Текущий язык

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Здесь можно добавить логику для смены языка в приложении
  };

  return (
    <div className=" h-[83px] header border-b-1 border-solid border- flex items-center justify-end">
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