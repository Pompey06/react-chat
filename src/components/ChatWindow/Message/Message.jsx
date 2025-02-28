import React from "react";
import axios from "axios";
import downloadIcon from "../../../assets/pdf.svg";
import "./Message.css";
import { useTranslation } from "react-i18next";

export default function Message({ text, isUser, isButton, onClick, filePath, filePaths }) {
   const { t } = useTranslation();

   // Преобразуем все пути к файлам в массив
   const allFilePaths = React.useMemo(() => {
      if (filePaths && Array.isArray(filePaths)) {
         return filePaths.filter((path) => typeof path === "string"); // Фильтруем только строки
      } else if (filePath) {
         return typeof filePath === "string"
            ? [filePath]
            : Array.isArray(filePath)
            ? filePath.filter((path) => typeof path === "string")
            : [];
      }
      return [];
   }, [filePath, filePaths]);

   // Функция для обработки текста с переносами строк
   function renderTextWithLineBreaks(text) {
      if (!text) return null;

      // Разбиваем текст по переносам строк
      return text.split("\n").map((line, index, array) => (
         <React.Fragment key={index}>
            {linkifyText(line)}
            {index < array.length - 1 && <br />}
         </React.Fragment>
      ));
   }

   function linkifyText(text) {
      if (!text) return null;

      // Комбинированное регулярное выражение для поиска как Markdown-ссылок, так и обычных URL
      const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s]+?)([),.?!]+)?(\s|$)/g;

      const elements = [];
      let lastIndex = 0;
      let match;

      while ((match = combinedRegex.exec(text)) !== null) {
         // Добавляем текст до совпадения
         if (match.index > lastIndex) {
            elements.push(text.substring(lastIndex, match.index));
         }

         // Проверяем, какой тип совпадения мы нашли
         if (match[1]) {
            // Это Markdown-ссылка [текст](url)
            const linkText = match[2];
            const url = match[3];

            elements.push(
               <a
                  key={`md-${match.index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message-link"
               >
                  {linkText}
               </a>
            );
         } else {
            // Это обычный URL
            const url = match[4];
            const trailing = match[5] || "";
            const space = match[6] || "";

            elements.push(
               <a
                  key={`url-${match.index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message-link"
               >
                  {url}
               </a>
            );

            elements.push(trailing + space);
         }

         lastIndex = combinedRegex.lastIndex;
      }

      // Если осталось что-то после последнего совпадения
      if (lastIndex < text.length) {
         elements.push(text.substring(lastIndex));
      }

      return elements;
   }

   // Проверяем, содержит ли текст переносы строк
   const hasLineBreaks = !isUser && text && text.includes("\n");

   // Функция для скачивания файла
   const handleDownload = async (e, path) => {
      e.preventDefault();
      if (!path || typeof path !== "string") {
         console.error("Invalid file path:", path);
         return;
      }

      try {
         const response = await axios({
            method: "get",
            url: `${import.meta.env.VITE_API_URL}/knowledge/get-file`,
            params: { path: path },
            responseType: "blob",
         });

         // Создаем URL для blob-данных
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement("a");
         link.href = url;
         // Извлекаем имя файла из пути
         const fileName = path.split("/").pop() || "file";
         link.setAttribute("download", fileName);
         document.body.appendChild(link);
         link.click();
         link.remove();
      } catch (error) {
         console.error("Ошибка загрузки файла:", error);
      }
   };

   // Функция для получения имени файла из пути
   const getFileName = (path) => {
      if (!path || typeof path !== "string") return "file";
      try {
         return path.split("/").pop() || "file";
      } catch (error) {
         console.error("Error getting file name:", error);
         return "file";
      }
   };

   return (
      <div
         className={`message mb-6 bg-white flex font-light ${
            isUser ? "user text-right self-end text-white" : "text-left ai text-black self-start"
         } ${
            isButton
               ? "cursor-pointer hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
               : ""
         }`}
         onClick={isButton ? onClick : undefined}
      >
         <div>
            {hasLineBreaks ? renderTextWithLineBreaks(text) : linkifyText(text)}
            {allFilePaths.length > 0 && (
               <div className="mt-2">
                  <div className="sources-label">{t("chat.sources")}</div>
                  <div className="file-download-container">
                     {allFilePaths.map((path, index) => {
                        if (!path || typeof path !== "string") return null;
                        const fileName = getFileName(path);
                        return (
                           <div key={index} className="file-item">
                              <a href="#" onClick={(e) => handleDownload(e, path)} className="file-download-link">
                                 <img src={downloadIcon} alt="Download file" className="file-icon" />
                                 <span className="file-name">{fileName}</span>
                              </a>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
