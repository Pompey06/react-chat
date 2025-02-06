// utils/feedbackStorage.js
const FEEDBACK_STORAGE_KEY = 'chat_feedback_state';

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