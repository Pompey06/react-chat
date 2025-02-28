// BadFeedbackRegistrationMessage.jsx
import React, { useState, useContext } from "react";
import RegistrationModal from "../Modal/RegistrationModal";
import { useTranslation } from "react-i18next";
import "./BadFeedbackRegistrationMessage.css";
import { ChatContext } from "../../../context/ChatContext";

export default function BadFeedbackRegistrationMessage({ currentChatId }) {
   const { addBotMessage } = useContext(ChatContext);
   const { t } = useTranslation();
   const [isModalOpen, setIsModalOpen] = useState(false);

   const openModal = () => {
      setIsModalOpen(true);
   };
   const closeModal = () => {
      setIsModalOpen(false);
   };

   const handleSubmit = (formData) => {
      // Здесь можно обработать данные формы (например, отправить их на API)
      closeModal();
   };

   return (
      <div className="bad-feedback-message message mb-8 bg-white flex font-light text-left ai self-start">
         <div>
            <p className="bad-feedback-text">{t("feedback.badFeedbackPromptText")}</p>
            <button className="bad-feedback-button" onClick={openModal}>
               {t("feedback.openRegistrationForm")}
            </button>
            <RegistrationModal
               isOpen={isModalOpen}
               onClose={closeModal}
               title="Регистрация заявки"
               description={t("feedback.registrationFormDescription")}
               onSubmit={handleSubmit}
               feedbackType="badRegistration"
               currentChatId={currentChatId}
               addBotMessage={addBotMessage}
            />
         </div>
      </div>
   );
}
