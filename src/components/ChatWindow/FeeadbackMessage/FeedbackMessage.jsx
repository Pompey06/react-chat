import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import './Feedbackmessage.css';
import badIcon from '../../../assets/bad.svg';
import goodIcon from '../../../assets/good.svg';

export default function FeedbackMessage({ text }) {
  const [modalType, setModalType] = useState(null); // null, 'good', 'bad'

  const openModal = (type) => setModalType(type); // Открыть модалку
  const closeModal = () => setModalType(null); // Закрыть модалку

  return (
    <div className="feedback-message message mb-8 bg-white flex font-light flex-col items-start">
      <p className="text-black mb-6">{text}</p>
      <div className="flex gap-6 feedback-message__btns">
        <button
          className="feedback-button flex gap-5 font-light"
          onClick={() => openModal('good')} // Открыть модалку "Хорошо"
        >
          <img src={goodIcon} alt="Good feedback" />
          Хорошо
        </button>
        <button
          className="feedback-button text-white flex gap-5 font-light"
          onClick={() => openModal('bad')} // Открыть модалку "Плохо"
        >
          <img src={badIcon} alt="Bad feedback" />
          Плохо
        </button>
      </div>

      <Modal
  isOpen={modalType === 'good'}
  onClose={closeModal}
  title="Спасибо за вашу оценку!"
  description="Мы рады, что вам понравилось. Хотите поделиться, что именно вам понравилось в ответе?"
/>

<Modal
  isOpen={modalType === 'bad'}
  onClose={closeModal}
  title="Нам жаль, что вы остались недовольны."
  description="Мы хотим стать лучше! Расскажите, что можно улучшить."
/>
    </div>
  );
}