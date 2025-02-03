import React, { useState, useContext } from 'react'; // Добавляем useContext
import { ChatContext } from '../../../context/ChatContext'; // Импортируем ChatContext
import Modal from '../Modal/Modal';
import './Feedbackmessage.css';
import badIcon from '../../../assets/bad.svg';
import badIconHover from '../../../assets/bad-white.svg';
import goodIcon from '../../../assets/good.svg';
import goodIconHover from '../../../assets/good-white.svg';
import { useTranslation } from 'react-i18next';

export default function FeedbackMessage() {
  const { t } = useTranslation();
  const { removeFeedbackMessage } = useContext(ChatContext); // Подключаем функцию из контекста
  const [modalType, setModalType] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <div className="feedback-message message mb-8 bg-white flex font-light flex-col items-start">
      <p className="text-black mb-6">{t('feedback.requestFeedback')}</p>
      <div className="flex gap-6 feedback-message__btns">
        {/* Кнопка "Хорошо" */}
        <button
          className="feedback-button flex gap-5 font-light bg-transparent text-black hover:text-white transition-colors duration-300"
          onMouseEnter={() => setHoveredButton('good')}
          onMouseLeave={() => setHoveredButton(null)}
          onTouchStart={() => setHoveredButton('good')}
          onTouchEnd={() => setHoveredButton(null)}
          onClick={() => openModal('good')}
        >
          <img
            className={`transition-opacity duration-300 ${hoveredButton === 'good' ? 'opacity-0' : 'opacity-100'}`}
            src={goodIcon}
            alt={t('feedback.goodAlt')}
          />
          <img
            className={`absolute transition-opacity duration-300 ${hoveredButton === 'good' ? 'opacity-100' : 'opacity-0'}`}
            src={goodIconHover}
            alt={t('feedback.goodAltHover')}
          />
          {t('feedback.good')}
        </button>

        {/* Кнопка "Плохо" */}
        <button
          className="feedback-button flex gap-5 font-light bg-transparent text-black hover:text-white transition-colors duration-300"
          onMouseEnter={() => setHoveredButton('bad')}
          onMouseLeave={() => setHoveredButton(null)}
          onTouchStart={() => setHoveredButton('bad')}
          onTouchEnd={() => setHoveredButton(null)}
          onClick={() => openModal('bad')}
        >
          <img
            className={`transition-opacity duration-300 ${hoveredButton === 'bad' ? 'opacity-0' : 'opacity-100'}`}
            src={badIcon}
            alt={t('feedback.badAlt')}
          />
          <img
            className={`absolute transition-opacity duration-300 ${hoveredButton === 'bad' ? 'opacity-100' : 'opacity-0'}`}
            src={badIconHover}
            alt={t('feedback.badAltHover')}
          />
          {t('feedback.bad')}
        </button>
      </div>

      {/* Модалка для "Хорошо" */}
      <Modal
        isOpen={modalType === 'good'}
        onClose={closeModal}
        title={t('feedback.goodModalTitle')}
        description={t('feedback.goodModalDescription')}
        onSubmit={removeFeedbackMessage} // Передаем функцию удаления
      />

      {/* Модалка для "Плохо" */}
      <Modal
        isOpen={modalType === 'bad'}
        onClose={closeModal}
        title={t('feedback.badModalTitle')}
        description={t('feedback.badModalDescription')}
        onSubmit={removeFeedbackMessage} // Передаем функцию удаления
      />
    </div>
  );
}