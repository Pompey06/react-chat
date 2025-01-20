import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import './Feedbackmessage.css';
import badIcon from '../../../assets/bad.svg';
import badIconHover from '../../../assets/bad-white.svg'; // Иконка при наведении
import goodIcon from '../../../assets/good.svg';
import goodIconHover from '../../../assets/good-white.svg'; // Иконка при наведении

export default function FeedbackMessage({ text }) {
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
  onClick={() => openModal('good')} // Открываем модалку
>
  <img
    className={`transition-opacity duration-300 ${hoveredButton === 'good' ? 'opacity-0' : 'opacity-100'}`}
    src={goodIcon}
    alt="Good feedback"
  />
  <img
    className={`absolute transition-opacity duration-300 ${hoveredButton === 'good' ? 'opacity-100' : 'opacity-0'}`}
    src={goodIconHover}
    alt="Good feedback hover"
  />
  Хорошо
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
    alt="Bad feedback"
  />
  <img
    className={`absolute transition-opacity duration-300 ${hoveredButton === 'bad' ? 'opacity-100' : 'opacity-0'}`}
    src={badIconHover}
    alt="Bad feedback hover"
  />
  Плохо
</button>
      </div>

      {/* Модалка для "Хорошо" */}
      <Modal
        isOpen={modalType === 'good'}
        onClose={closeModal}
        title="Спасибо за вашу оценку!"
        description="Мы рады, что вам понравилось. Хотите поделиться, что именно вам понравилось в ответе?"
      />

      {/* Модалка для "Плохо" */}
      <Modal
        isOpen={modalType === 'bad'}
        onClose={closeModal}
        title="Нам жаль, что вы остались недовольны."
        description="Мы хотим стать лучше! Расскажите, что можно улучшить."
      />
    </div>
  );
}