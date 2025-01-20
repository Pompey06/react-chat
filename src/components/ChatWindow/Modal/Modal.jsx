'use client';

import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import closeIcon from '../../../assets/close.svg';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, description }) {
  const [feedback, setFeedback] = useState('');

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmit = () => {
    console.log('Feedback submitted:', feedback);
    setFeedback('');
    onClose();
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
              alt="Close"
            />

            {/* Modal content */}
            <div className="bg-white modal p-8">
              <h2 className="font-light text-2xl/6 mb-2">{title}</h2>
              <p className="font-light text-base/6 mb-3">{description}</p>

              {/* Textarea for feedback */}
              <textarea
                className="w-full h-64 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Оставьте свой отзыв ..."
                value={feedback}
                onChange={handleFeedbackChange}
              ></textarea>

              {/* Submit button */}
              <div className="mt-6   flex justify-end">
                <button
                  type="button"
                  className="feedback__button bg-blue text-xl text-white text-sm font-light shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleSubmit}
                >
                  Отправить
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}