import React, { useRef, useState } from "react";
import { BaseModal } from "./BaseModal";
import clearIcon from "../../../assets/clearIcon.svg";
import InputMask from "react-input-mask";
import { useTranslation } from "react-i18next";
import "./Modal.css";
import axios from "axios";

export default function RegistrationModal({ isOpen, onClose, title, onSubmit, currentChatId }) {
   const { t } = useTranslation();

   // Состояние для типа лица: 'physical' (по умолчанию) или 'legal'
   const [entityType, setEntityType] = useState("physical");
   // Состояние для открытого селекта региона (если потребуется в будущем)
   const [regionOpen, setRegionOpen] = useState(false);

   // Используем refs для полей формы
   const surnameRef = useRef(null);
   const nameRef = useRef(null);
   const patronymicRef = useRef(null);
   const phoneRef = useRef(null);
   const emailRef = useRef(null);
   const regionRef = useRef(null);
   const descriptionRef = useRef(null);
   const binRef = useRef(null);
   const iinRef = useRef(null);

   // Состояние для выбранных файлов
   const [selectedFiles, setSelectedFiles] = useState([]);

   const [isSubmitting, setIsSubmitting] = useState(false);
   // errors: если значение true — добавляется класс error
   const [errors, setErrors] = useState({});

   // При любом изменении значения очищаем ошибку для этого поля
   const handleChange = (e) => {
      setErrors((prev) => ({ ...prev, [e.target.name]: false }));
   };

   // onBlur-валидация для полей (BIN, ИИН, телефон, email)
   const handleBlur = (e) => {
      const { name, value } = e.target;
      let error = false;
      if (value.trim() === "") {
         error = true;
      } else {
         if (name === "bin" || name === "iin") {
            error = !/^\d+$/.test(value);
         }
         if (name === "phone") {
            // Телефон: разрешаем цифры, пробелы, плюс, тире, скобки (без проверки длины)
            error = !/^[0-9+\-\s()]+$/.test(value);
         }
         if (name === "email") {
            error = !/\S+@\S+\.\S+/.test(value);
         }
      }
      setErrors((prev) => ({ ...prev, [name]: error }));
   };

   // Для полей, где разрешены только цифры (BIN, ИИН, телефон)
   const handleDigitInput = (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
   };

   // Обработка выбора файлов
   const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
   };

   const handleChooseFile = () => {
      document.getElementById("fileInput").click();
   };

   const handleRemoveFile = (index) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
   };

   const handleSubmit = async () => {
      const formData = new FormData();

      // Общие данные для обоих типов
      formData.append("conversation_id", currentChatId || "");
      formData.append("last_name", surnameRef.current.value);
      formData.append("first_name", nameRef.current.value);
      formData.append("middle_name", patronymicRef.current.value);
      formData.append("phone", phoneRef.current.value);
      formData.append("email", emailRef.current.value);
      formData.append("region", regionRef.current.value);
      formData.append("description", descriptionRef.current.value);

      // Добавляем файлы
      selectedFiles.forEach((file) => {
         formData.append("file", file);
      });

      // Если выбрано юридическое лицо, добавляем BIN и IIN
      if (entityType === "legal") {
         formData.append("bin_number", binRef.current.value);
         formData.append("iin_number", iinRef.current.value);
      }

      // Валидация
      const newErrors = {};
      Object.entries({
         last_name: surnameRef.current.value,
         first_name: nameRef.current.value,
         phone: phoneRef.current.value,
         email: emailRef.current.value,
         region: regionRef.current.value,
         ...(entityType === "legal" && {
            bin_number: binRef.current.value,
            iin_number: iinRef.current.value,
         }),
      }).forEach(([key, value]) => {
         if (!value.trim()) {
            newErrors[key] = true;
         } else {
            if ((key === "bin_number" || key === "iin_number") && !/^\d+$/.test(value)) {
               newErrors[key] = true;
            }
            if (key === "phone" && !/^[0-9+\-\s()]+$/.test(value)) {
               newErrors[key] = true;
            }
            if (key === "email" && !/\S+@\S+\.\S+/.test(value)) {
               newErrors[key] = true;
            }
         }
      });

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      setIsSubmitting(true);

      try {
         // Выбираем эндпоинт в зависимости от типа лица
         const endpoint =
            entityType === "physical"
               ? `${import.meta.env.VITE_API_URL}/form/submit-form/individual`
               : `${import.meta.env.VITE_API_URL}/form/submit-form/corporate`;

         // Отправка данных на API
         const response = await axios.post(endpoint, formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });

         console.log("Форма успешно отправлена:", response.data);

         // Очистка формы после успешной отправки
         if (surnameRef.current) surnameRef.current.value = "";
         if (nameRef.current) nameRef.current.value = "";
         if (patronymicRef.current) patronymicRef.current.value = "";
         if (phoneRef.current) phoneRef.current.value = "";
         if (emailRef.current) emailRef.current.value = "";
         if (regionRef.current) regionRef.current.value = "";
         if (descriptionRef.current) descriptionRef.current.value = "";
         if (binRef.current) binRef.current.value = "";
         if (iinRef.current) iinRef.current.value = "";
         setSelectedFiles([]);
         setErrors({});
         onSubmit(response.data); // Вызываем callback после успешной отправки
      } catch (error) {
         console.error("Ошибка при отправке формы:", error);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleClose = () => {
      if (surnameRef.current) surnameRef.current.value = "";
      if (nameRef.current) nameRef.current.value = "";
      if (patronymicRef.current) patronymicRef.current.value = "";
      if (phoneRef.current) phoneRef.current.value = "";
      if (emailRef.current) emailRef.current.value = "";
      if (regionRef.current) regionRef.current.value = "";
      if (descriptionRef.current) descriptionRef.current.value = "";
      if (binRef.current) binRef.current.value = "";
      if (iinRef.current) iinRef.current.value = "";
      setErrors({});
      setIsSubmitting(false);
      setSelectedFiles([]);
      onClose();
   };

   return (
      <BaseModal isOpen={isOpen} onClose={handleClose} title={title} modalClassName="registration-modal">
         <form className="registration-form" onSubmit={(e) => e.preventDefault()}>
            {/* Блок выбора типа лица */}
            <div className="entity-selection flex gap-4 mb-4">
               <div
                  className="entity-option flex items-center cursor-pointer"
                  onClick={() => setEntityType("physical")}
               >
                  <div className={`entity-radio ${entityType === "physical" ? "active" : ""}`}></div>
                  <span className="ml-2">{t("registration.physical")}</span>
               </div>
               <div className="entity-option flex items-center cursor-pointer" onClick={() => setEntityType("legal")}>
                  <div className={`entity-radio ${entityType === "legal" ? "active" : ""}`}></div>
                  <span className="ml-2">{t("registration.legal")}</span>
               </div>
            </div>

            {/* Общие поля формы */}
            <div className="form-group mb-2.5">
               <input
                  type="text"
                  id="surname"
                  name="surname"
                  ref={surnameRef}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`registration-input w-full ${errors.surname ? "error" : ""}`}
                  placeholder={t("registration.surname")}
               />
            </div>
            <div className="form-group mb-2.5">
               <input
                  type="text"
                  id="name"
                  name="name"
                  ref={nameRef}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`registration-input w-full ${errors.name ? "error" : ""}`}
                  placeholder={t("registration.name")}
               />
            </div>
            <div className="form-group mb-2.5">
               <input
                  type="text"
                  id="patronymic"
                  name="patronymic"
                  ref={patronymicRef}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`registration-input w-full ${errors.patronymic ? "error" : ""}`}
                  placeholder={t("registration.patronymic")}
               />
            </div>
            <div className="form-group mb-2.5">
               <InputMask mask="+7 9999 99 99 99" maskChar=" " onBlur={handleBlur} onChange={handleChange}>
                  {(inputProps) => (
                     <input
                        {...inputProps}
                        ref={phoneRef}
                        className={`registration-input w-full ${errors.phone ? "error" : ""}`}
                        placeholder={t("registration.phone")}
                     />
                  )}
               </InputMask>
            </div>
            <div className="form-group mb-2.5">
               <input
                  type="email"
                  id="email"
                  name="email"
                  ref={emailRef}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`registration-input w-full ${errors.email ? "error" : ""}`}
                  placeholder={t("registration.email")}
               />
            </div>

            {entityType === "legal" && (
               <div className="flex gap-4 mb-2.5">
                  <input
                     type="text"
                     id="bin"
                     name="bin"
                     ref={binRef}
                     onInput={handleDigitInput}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     className={`registration-input w-1/2 ${errors.bin ? "error" : ""}`}
                     placeholder={t("registration.bin")}
                  />
                  <input
                     type="text"
                     id="iin"
                     name="iin"
                     ref={iinRef}
                     onInput={handleDigitInput}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     className={`registration-input w-1/2 ${errors.iin ? "error" : ""}`}
                     placeholder={t("registration.iin")}
                  />
               </div>
            )}

            {/* Поле-селект "Выберите регион" с кликабельной стрелкой */}
            <div className="form-group mb-2.5">
               <label className="form-group mb-2.5 custom-select-container">
                  <select id="region" name="region" ref={regionRef} className="registration-input w-full custom-select">
                     <option value="">{t("registration.region.select")}</option>
                     <option value="1">{t("registration.region.option1")}</option>
                     <option value="2">{t("registration.region.option2")}</option>
                     <option value="3">{t("registration.region.option3")}</option>
                  </select>
                  <span className="custom-select-arrow"></span>
               </label>
            </div>

            <div className="form-group mb-2.5">
               <textarea
                  id="description"
                  name="description"
                  ref={descriptionRef}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`registration-textarea w-full ${errors.description ? "error" : ""}`}
                  placeholder={t("registration.description")}
                  rows="5"
               ></textarea>
            </div>

            {/* Блок загрузки файлов */}
            <div className="file-upload-section mb-4">
               <button type="button" className="choose-file-button" onClick={handleChooseFile}>
                  {t("registration.chooseFile")}
               </button>
               <div className="file-upload-info text-sm text-gray-500 mt-1">{t("registration.fileInfo")}</div>
               <input type="file" id="fileInput" multiple style={{ display: "none" }} onChange={handleFileChange} />
               {selectedFiles.length > 0 && (
                  <div className="uploaded-files mt-2">
                     {selectedFiles.map((file, index) => (
                        <div
                           key={index}
                           className="uploaded-file flex items-center justify-between text-sm text-gray-700"
                        >
                           <span>
                              {file.name} ({(file.size / 1024).toFixed(1)} КБ)
                           </span>
                           <img
                              src={clearIcon}
                              alt={t("registration.removeFile")}
                              className="clear-icon cursor-pointer"
                              onClick={() => handleRemoveFile(index)}
                           />
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Новый блок с текстом согласия */}
            <div className="consent-text">{t("registration.consent")}</div>

            <div className="mt-6 flex justify-end">
               <button
                  type="button"
                  disabled={isSubmitting}
                  className={`feedback__button bg-blue text-xl text-white font-light shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                     isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSubmit}
               >
                  {isSubmitting ? t("registration.submitting") : t("registration.submit")}
               </button>
            </div>
         </form>
      </BaseModal>
   );
}
