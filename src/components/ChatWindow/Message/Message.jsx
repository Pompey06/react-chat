import React from 'react';
import axios from 'axios';
import downloadIcon from '../../../assets/csv.svg';
import './Message.css';
import { useTranslation } from 'react-i18next';

export default function Message({ text, isUser, isButton, onClick, filePath }) {
   const { t } = useTranslation();
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
        {text}
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
