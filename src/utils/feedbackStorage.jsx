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

// Функции для работы с filePath
export const getFilePathsState = () => {
   try {
      return JSON.parse(localStorage.getItem(FILE_PATHS_KEY)) || {};
   } catch {
      return {};
   }
};

export const saveFilePath = (chatId, messageIndex, filePath) => {
   const currentState = getFilePathsState();
   if (!currentState[chatId]) {
      currentState[chatId] = {};
   }
   currentState[chatId][messageIndex] = filePath;
   localStorage.setItem(FILE_PATHS_KEY, JSON.stringify(currentState));
};

export const getFilePaths = (chatId) => {
   const state = getFilePathsState();
   return state[chatId] || {};
};

export const saveFilePathByBotIndex = (chatId, botIndex, filePath) => {
   try {
      const filePaths = getFilePathsState();

      if (!filePaths[chatId]) {
         filePaths[chatId] = {};
      }

      // Сохраняем по индексу бота (0, 1, 2, ...), а не по абсолютному индексу
      filePaths[chatId][`bot_${botIndex}`] = filePath;
      localStorage.setItem(FILE_PATHS_KEY, JSON.stringify(filePaths));
   } catch (error) {
      console.error("Error saving file path:", error);
   }
};

export const getFilePathByBotIndex = (chatId, botIndex) => {
   try {
      const filePaths = getFilePathsState();
      return filePaths[chatId]?.[`bot_${botIndex}`] || null;
   } catch (error) {
      console.error("Error getting file path:", error);
      return null;
   }
};
