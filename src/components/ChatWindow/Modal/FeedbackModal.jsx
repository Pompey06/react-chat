// FeedbackModal.jsx
import React, { useState } from 'react';
import { BaseModal } from './BaseModal';
import { useTranslation } from 'react-i18next';
import './Modal.css';

export default function FeedbackModal({ isOpen, onClose, title, description, onSubmit }) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
    if (event.target.value.trim() !== '') {
      setIsError(false);
    }
  };

  const handleSubmit = async () => {
    if (feedback.trim() === '' || isSubmitting) {
      setIsError(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback('');
    setIsError(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title={title}>
      <p className="font-light text-base/6 mb-3">{description}</p>
      <textarea
        className={`w-full h-64 p-4 focus:outline-none focus:ring-2 ${
          isError ? 'border-2 border-red-500' : 'focus:ring-blue-500'
        }`}
        placeholder={t('modal.placeholder')}
        value={feedback}
        onChange={handleFeedbackChange}
      ></textarea>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          className={`feedback__button bg-blue text-xl text-white text-sm font-light shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleSubmit}
        >
          {isSubmitting ? t('modal.submitting') : t('modal.submit')}
        </button>
      </div>
    </BaseModal>
  );
}
