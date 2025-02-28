// utils/feedbackStorage.js

// Ключи для localStorage
const FEEDBACK_STORAGE_KEY = "chat_feedback_state";
const BAD_FEEDBACK_PROMPT_KEY = "chat_bad_feedback_prompt";
const FILE_PATHS_KEY = "chat_file_paths";

// Базовые функции для работы с localStorage
export const getFeedbackState = () => {
   try {
      return JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY)) || {};
   } catch {
      return {};
   }
};

export const saveFeedbackState = (chatId, messageIndex) => {
   const currentState = getFeedbackState();
   if (!currentState[chatId]) {
      currentState[chatId] = [];
   }
   if (!currentState[chatId].includes(messageIndex)) {
      currentState[chatId].push(messageIndex);
   }
   localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(currentState));
};

export const hasFeedback = (chatId, messageIndex) => {
   const state = getFeedbackState();
   return state[chatId]?.includes(messageIndex) || false;
};

// Функции для работы с BadFeedbackPrompt
export const getBadFeedbackPromptState = () => {
   try {
      return JSON.parse(localStorage.getItem(BAD_FEEDBACK_PROMPT_KEY)) || {};
   } catch {
      return {};
   }
};

export const saveBadFeedbackPromptState = (chatId) => {
   const currentState = getBadFeedbackPromptState();
   currentState[chatId] = true;
   localStorage.setItem(BAD_FEEDBACK_PROMPT_KEY, JSON.stringify(currentState));
};

export const hasBadFeedbackPrompt = (chatId) => {
   const state = getBadFeedbackPromptState();
   return !!state[chatId];
};

// Функции для работы с filePaths
export const getFilePathsState = () => {
   try {
      return JSON.parse(localStorage.getItem(FILE_PATHS_KEY)) || {};
   } catch {
      return {};
   }
};

/**
 * Сохраняет пути к файлам для сообщения
 * @param {string} chatId - ID чата
 * @param {number} messageIndex - Индекс сообщения
 * @param {string|string[]} filePath - Путь к файлу или массив путей
 */
export const saveFilePath = (chatId, messageIndex, filePath) => {
   const currentState = getFilePathsState();
   if (!currentState[chatId]) {
      currentState[chatId] = {};
   }

   // Преобразуем в массив, если передана строка
   const pathsArray = Array.isArray(filePath) ? filePath : [filePath];

   // Сохраняем массив путей
   currentState[chatId][messageIndex] = pathsArray;

   localStorage.setItem(FILE_PATHS_KEY, JSON.stringify(currentState));
};

/**
 * Получает все пути к файлам для чата
 * @param {string} chatId - ID чата
 * @returns {Object} - Объект с путями к файлам по индексам сообщений
 */
export const getFilePaths = (chatId) => {
   const state = getFilePathsState();
   return state[chatId] || {};
};

/**
 * Сохраняет пути к файлам по индексу бота
 * @param {string} chatId - ID чата
 * @param {number} botIndex - Индекс сообщения бота
 * @param {string|string[]} filePath - Путь к файлу или массив путей
 */
export const saveFilePathByBotIndex = (chatId, botIndex, filePath) => {
   try {
      const filePaths = getFilePathsState();

      if (!filePaths[chatId]) {
         filePaths[chatId] = {};
      }

      // Преобразуем в массив, если передана строка
      const pathsArray = Array.isArray(filePath) ? filePath : [filePath];

      // Сохраняем массив путей по индексу бота
      filePaths[chatId][`bot_${botIndex}`] = pathsArray;

      localStorage.setItem(FILE_PATHS_KEY, JSON.stringify(filePaths));
   } catch (error) {
      console.error("Error saving file paths:", error);
   }
};

/**
 * Получает пути к файлам по индексу бота
 * @param {string} chatId - ID чата
 * @param {number} botIndex - Индекс сообщения бота
 * @returns {string[]} - Массив путей к файлам
 */
export const getFilePathByBotIndex = (chatId, botIndex) => {
   try {
      const filePaths = getFilePathsState();
      const paths = filePaths[chatId]?.[`bot_${botIndex}`];

      // Если путей нет, возвращаем пустой массив
      if (!paths) return [];

      // Если путь - строка, преобразуем в массив
      return Array.isArray(paths) ? paths : [paths];
   } catch (error) {
      console.error("Error getting file paths:", error);
      return [];
   }
};

/**
 * Добавляет путь к файлу в существующий массив путей
 * @param {string} chatId - ID чата
 * @param {number} messageIndex - Индекс сообщения
 * @param {string} filePath - Путь к файлу
 */
export const addFilePath = (chatId, messageIndex, filePath) => {
   const currentState = getFilePathsState();
   if (!currentState[chatId]) {
      currentState[chatId] = {};
   }

   // Если для этого индекса уже есть пути, добавляем новый
   if (!currentState[chatId][messageIndex]) {
      currentState[chatId][messageIndex] = [];
   } else if (!Array.isArray(currentState[chatId][messageIndex])) {
      // Если текущее значение - строка, преобразуем в массив
      currentState[chatId][messageIndex] = [currentState[chatId][messageIndex]];
   }

   // Добавляем новый путь, если его еще нет
   if (!currentState[chatId][messageIndex].includes(filePath)) {
      currentState[chatId][messageIndex].push(filePath);
   }

   localStorage.setItem(FILE_PATHS_KEY, JSON.stringify(currentState));
};

/**
 * Добавляет путь к файлу в существующий массив путей по индексу бота
 * @param {string} chatId - ID чата
 * @param {number} botIndex - Индекс сообщения бота
 * @param {string} filePath - Путь к файлу
 */
export const addFilePathByBotIndex = (chatId, botIndex, filePath) => {
   try {
      const filePaths = getFilePathsState();

      if (!filePaths[chatId]) {
         filePaths[chatId] = {};
      }

      const botKey = `bot_${botIndex}`;

      // Если для этого индекса уже есть пути, добавляем новый
      if (!filePaths[chatId][botKey]) {
         filePaths[chatId][botKey] = [];
      } else if (!Array.isArray(filePaths[chatId][botKey])) {
         // Если текущее значение - строка, преобразуем в массив
         filePaths[chatId][botKey] = [filePaths[chatId][botKey]];
      }

      // Добавляем новый путь, если его еще нет
      if (!filePaths[chatId][botKey].includes(filePath)) {
         filePaths[chatId][botKey].push(filePath);
      }

      localStorage.setItem(FILE_PATHS_KEY, JSON.stringify(filePaths));
   } catch (error) {
      console.error("Error adding file path:", error);
   }
};

/**
 * Очищает все пути к файлам для чата
 * @param {string} chatId - ID чата
 */
export const clearFilePaths = (chatId) => {
   const currentState = getFilePathsState();
   if (currentState[chatId]) {
      delete currentState[chatId];
      localStorage.setItem(FILE_PATHS_KEY, JSON.stringify(currentState));
   }
};
