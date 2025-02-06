// FeedbackMessage.jsx
import React, { useState, useContext, useCallback } from 'react';
import { ChatContext } from '../../../context/ChatContext';
import Modal from '../Modal/Modal';
import './Feedbackmessage.css';
import badIcon from '../../../assets/bad.svg';
import badIconHover from '../../../assets/bad-white.svg';
import goodIcon from '../../../assets/good.svg';
import goodIconHover from '../../../assets/good-white.svg';
import { useTranslation } from 'react-i18next';
import { hasFeedback } from '../../../utils/feedbackStorage';

export default function FeedbackMessage({ messageIndex }) {
   const { currentChatId } = useContext(ChatContext);
  const { t } = useTranslation();
  const { removeFeedbackMessage, sendFeedback } = useContext(ChatContext);
  const [modalType, setModalType] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);

  if (hasFeedback(currentChatId, messageIndex)) {
   return null;
 }

  const openModal = (type) => {
    setSelectedMessageIndex(messageIndex);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedMessageIndex(null);
  };

  const handleFeedbackSubmit = useCallback(async (text) => {
    try {
      await sendFeedback(modalType, text, messageIndex);
      closeModal();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }, [sendFeedback, modalType, messageIndex, closeModal]);

  return (
    <div className="feedback-message message mb-8 bg-white flex font-light flex-col items-start">
      <p className="text-black mb-6">{t('feedback.requestFeedback')}</p>
      <div className="flex gap-6 feedback-message__btns">
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

      <Modal
        isOpen={modalType === 'good'}
        onClose={closeModal}
        title={t('feedback.goodModalTitle')}
        description={t('feedback.goodModalDescription')}
        onSubmit={handleFeedbackSubmit}
        feedbackType="good"
        messageIndex={selectedMessageIndex}
      />

      <Modal
        isOpen={modalType === 'bad'}
        onClose={closeModal}
        title={t('feedback.badModalTitle')}
        description={t('feedback.badModalDescription')}
        onSubmit={handleFeedbackSubmit}
        feedbackType="bad"
        messageIndex={selectedMessageIndex}
      />
    </div>
  );
}