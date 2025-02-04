'use client';

import { useState, useContext } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import closeIcon from '../../../assets/close.svg';
import './Modal.css';
import { useTranslation } from 'react-i18next'; // Импортируем хук для перевода
import { ChatContext } from '../../../context/ChatContext';


export default function Modal({ isOpen, onClose, title, description, onSubmit, feedbackType, messageIndex }) {
   const { sendFeedback } = useContext(ChatContext);
   const { t } = useTranslation(); // Инициализируем хук для перевода
  const [feedback, setFeedback] = useState('');

  const [isError, setIsError] = useState(false); // Состояние для ошибки

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
    if (event.target.value.trim() !== '') {
      setIsError(false); // Убираем ошибку, если пользователь ввел текст
    }
  };

  const handleSubmit = async () => {
   if (feedback.trim() === '') {
     setIsError(true);
     return;
   }

   try {
     await sendFeedback(feedbackType, feedback, messageIndex);
     setFeedback('');
     if (onSubmit) {
       onSubmit();
     }
     onClose();
   } catch (error) {
     console.error('Error submitting feedback:', error);
   }
 };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            {/* Close button */}
            <img
              src={closeIcon}
              onClick={onClose}
              className="absolute top-4 right-4 cursor-pointer w-6 h-6"
              alt={t('modal.close')} // Перевод строки "Закрыть"
            />

            {/* Modal content */}
            <div className="bg-white modal p-8">
              <h2 className="font-light text-2xl/6 mb-2">{title}</h2>
              <p className="font-light text-base/6 mb-3">{description}</p>

              {/* Textarea for feedback */}
              <textarea
                className={`w-full h-64 p-4 focus:outline-none focus:ring-2 ${
                  isError ? 'border-2 border-red-500' : 'focus:ring-blue-500'
                }`}
                placeholder={t('modal.placeholder')} // Перевод строки "Оставьте свой отзыв ..."
                value={feedback}
                onChange={handleFeedbackChange}
              ></textarea>

              {/* Submit button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="feedback__button bg-blue text-xl text-white text-sm font-light shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleSubmit} // Обработчик отправки
                >
                  {t('modal.submit')} {/* Перевод строки "Отправить" */}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}