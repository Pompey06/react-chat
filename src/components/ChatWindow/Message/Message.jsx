import React from 'react';
import axios from 'axios';
import downloadIcon from '../../../assets/csv.svg';
import './Message.css';
import { useTranslation } from 'react-i18next';

export default function Message({ text, isUser, isButton, onClick, filePath }) {
   const { t } = useTranslation();

   function linkifyText(text) {
      // Регулярное выражение, которое находит URL и отделяет завершающие символы (если они есть)
      const urlRegex = /(https?:\/\/[^\s]+?)([),.?!]+)?(\s|$)/g;
      const elements = [];
      let lastIndex = 0;
      let match;
      while ((match = urlRegex.exec(text)) !== null) {
        // Добавляем текст до URL
        if (match.index > lastIndex) {
          elements.push(text.substring(lastIndex, match.index));
        }
        // match[1] — URL без завершающих символов
        // match[2] — завершающие символы (если есть)
        // match[3] — пробельный разделитель или конец строки
        const url = match[1];
        const trailing = match[2] || "";
        // Формируем ссылку
        elements.push(
          <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="message-link">
            {url}
          </a>
        );
        // Добавляем завершающие символы и разделитель как текст
        elements.push(trailing);
        elements.push(match[3]);
        lastIndex = urlRegex.lastIndex;
      }
      // Если осталось что-то после последнего совпадения, добавляем это
      if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
      }
      return elements;
    }
    
   

  // Функция для скачивания файла
  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/knowledge/get-file?path=${encodeURIComponent(filePath)}`,
        null,
        { responseType: 'blob' }
      );
      // Создаем URL для blob-данных
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Извлекаем имя файла из пути
      link.setAttribute('download', filePath.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
    }
  };

  const fileName = filePath ? filePath.split('/').pop() : '';

  return (
    <div
      className={`message mb-8 bg-white flex font-light ${
        isUser
          ? 'user text-right self-end text-white'
          : 'text-left ai text-black self-start'
      } ${isButton ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''}`}
      onClick={isButton ? onClick : undefined}
    >
      <div>
      {linkifyText(text)}
        {filePath && (
          <div className="mt-2 flex items-center">
            <div className="sources-label">{t('chat.sources')}</div>
            <div className="file-download-container">
              <a href="#" onClick={handleDownload} className="file-download-link">
                <img src={downloadIcon} alt="Download file" className="file-icon" />
                <span className="file-name">{fileName}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
