import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import './Feedbackmessage.css';
import badIcon from '../../../assets/bad.svg';
import badIconHover from '../../../assets/bad-white.svg'; // Иконка при наведении
import goodIcon from '../../../assets/good.svg';
import goodIconHover from '../../../assets/good-white.svg'; // Иконка при наведении
import { useTranslation } from 'react-i18next'; // Импортируем хук для перевода

export default function FeedbackMessage({ text }) {
  const { t } = useTranslation(); // Инициализируем хук для перевода
  const [modalType, setModalType] = useState(null); // null, 'good', 'bad'
  const [hoveredButton, setHoveredButton] = useState(null); // null, 'good', 'bad'

  const openModal = (type) => setModalType(type); // Открыть модалку
  const closeModal = () => setModalType(null); // Закрыть модалку

  return (
    <div className="feedback-message message mb-8 bg-white flex font-light flex-col items-start">
      <p className="text-black mb-6">{text}</p>
      <div className="flex gap-6 feedback-message__btns">
        {/* Кнопка "Хорошо" */}
        <button
          className="feedback-button flex gap-5 font-light bg-transparent text-black hover:text-white transition-colors duration-300"
          onMouseEnter={() => setHoveredButton('good')} // Наведение мыши
          onMouseLeave={() => setHoveredButton(null)} // Убираем наведение
          onTouchStart={() => setHoveredButton('good')} // Для мобильных устройств
          onTouchEnd={() => setHoveredButton(null)} // Убираем состояние при отпускании
          onClick={() => openModal('good')}
        >
          <img
            className={`transition-opacity duration-300 ${hoveredButton === 'good' ? 'opacity-0' : 'opacity-100'}`}
            src={goodIcon}
            alt={t('feedback.goodAlt')} // Перевод строки "Хорошо"
          />
          <img
            className={`absolute transition-opacity duration-300 ${hoveredButton === 'good' ? 'opacity-100' : 'opacity-0'}`}
            src={goodIconHover}
            alt={t('feedback.goodAltHover')} // Перевод строки "Хорошо (наведение)"
          />
          {t('feedback.good')} {/* Перевод строки "Хорошо" */}
        </button>

        {/* Кнопка "Плохо" */}
        <button
          className="feedback-button flex gap-5 font-light bg-transparent text-black hover:text-white transition-colors duration-300"
          onMouseEnter={() => setHoveredButton('bad')} // Наведение мыши
          onMouseLeave={() => setHoveredButton(null)} // Убираем наведение
          onTouchStart={() => setHoveredButton('bad')} // Для мобильных устройств
          onTouchEnd={() => setHoveredButton(null)} // Убираем состояние при отпускании
          onClick={() => openModal('bad')} // Открываем модалку
        >
          <img
            className={`transition-opacity duration-300 ${hoveredButton === 'bad' ? 'opacity-0' : 'opacity-100'}`}
            src={badIcon}
            alt={t('feedback.badAlt')} // Перевод строки "Плохо"
          />
          <img
            className={`absolute transition-opacity duration-300 ${hoveredButton === 'bad' ? 'opacity-100' : 'opacity-0'}`}
            src={badIconHover}
            alt={t('feedback.badAltHover')} // Перевод строки "Плохо (наведение)"
          />
          {t('feedback.bad')} {/* Перевод строки "Плохо" */}
        </button>
      </div>

      {/* Модалка для "Хорошо" */}
      <Modal
        isOpen={modalType === 'good'}
        onClose={closeModal}
        title={t('feedback.goodModalTitle')} // Перевод заголовка модалки
        description={t('feedback.goodModalDescription')} // Перевод описания модалки
      />

      {/* Модалка для "Плохо" */}
      <Modal
        isOpen={modalType === 'bad'}
        onClose={closeModal}
        title={t('feedback.badModalTitle')} // Перевод заголовка модалки
        description={t('feedback.badModalDescription')} // Перевод описания модалки
      />
    </div>
  );
}