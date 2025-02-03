import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const { t } = useTranslation();

  // 1) Сразу создаём один пустой чат (чтобы пользователь мог сразу отправлять сообщения)
  const defaultChat = {
   id: generateId(),
   messages: [
     {
      text: t('chat.greeting'),
       isUser: false, // Сообщение от бота
       isFeedback: false,
       isButton: false
     }
   ],
   isEmpty: true, // Новый флаг для проверки, пустой ли чат
   showInitialButtons: true, // Показывать ли кнопки в этом чате
   buttonsWereHidden: false, // Флаг, указывающий, что кнопки уже были скрыты
   buttonsWereShown: false // Флаг, указывающий, что кнопки уже были показаны
 };

  const [chats, setChats] = useState([defaultChat]);
  const [currentChatId, setCurrentChatId] = useState(defaultChat.id);

  const [isTyping, setIsTyping] = useState(false);
  const [narrowingFilter, setNarrowingFilter] = useState(null); // Храним выбранное значение

  // Функция для загрузки строк с API
  const fetchInitialMessages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/assistant/narrowing-filters`);
      const messages = res.data; // Ожидаем массив строк

      // Добавляем каждую строку как сообщение пользователя
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                ...messages.map((text) => ({
                  text,
                  isUser: true, // Сообщения выглядят как пользовательские
                  isFeedback: false,
                  isButton: true // Указываем, что это кнопка
                }))
              ],
              buttonsWereShown: true // Фиксируем, что кнопки были показаны
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Ошибка при загрузке начальных сообщений:', error);
    }
  };

  // Загружаем данные при монтировании
  useEffect(() => {
    const currentChat = chats.find((chat) => chat.id === currentChatId);

    // Загружаем кнопки только если они ещё не были показаны и не скрыты
    if (currentChat && !currentChat.buttonsWereShown && !currentChat.buttonsWereHidden) {
      fetchInitialMessages();
    }
  }, [currentChatId]); // Выполняется при смене текущего чата

  const createNewChat = () => {
   const currentChat = chats.find((c) => c.id === currentChatId);
   if (!currentChat) return;
 
   // Если текущий чат пустой, не создаём новый
   if (currentChat.isEmpty) {
     return;
   }
 
   // Проверяем, есть ли уже пустой чат
   const emptyChat = chats.find((c) => c.id !== currentChatId && c.isEmpty);
   if (emptyChat) {
     setCurrentChatId(emptyChat.id);
     return;
   }
 
   // Создаём новый пустой чат с первым сообщением от бота
   const newChat = {
     id: generateId(),
     messages: [
       {
         text: t('chat.greeting'), // Используем перевод для первого сообщения
         isUser: false, // Сообщение от бота
         isFeedback: false,
         isButton: false
       }
     ],
     isEmpty: true, // Новый чат всегда пустой
     showInitialButtons: true, // В новом чате кнопки должны быть видимы
     buttonsWereHidden: false, // Кнопки ещё не скрыты
     buttonsWereShown: false // Кнопки ещё не были показаны
   };
 
   setChats((prev) => [...prev, newChat]);
   setCurrentChatId(newChat.id);
 };

  const switchChat = (chatId) => {
    if (chatId === currentChatId) {
      return;
    }
    setCurrentChatId(chatId);
  };

  // Добавляем сообщение (сначала пользовательское, потом ответ сервера)
  async function createMessage(text, isFeedback = false) {
    if (!currentChatId) {
      return;
    }

    // 1) Убираем кнопки, если они ещё отображаются
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            isEmpty: false, // Чат больше не пустой
            showInitialButtons: false, // Скрываем кнопки
            buttonsWereHidden: true, // Фиксируем, что кнопки были скрыты
            messages: chat.messages.filter((message) => !message.isButton) // Убираем кнопки
          };
        }
        return chat;
      })
    );

    // 2) Добавляем сообщение пользователя
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                text,
                isUser: true,
                isFeedback
              }
            ]
          };
        }
        return chat;
      })
    );

    // Отображаем "печатает..."
    setIsTyping(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/assistant/ask`,
        null,
        {
          params: {
            prompt: text,
            narrowing_filter: narrowingFilter || undefined // Отправляем фильтр, если он выбран
          }
        }
      );

      // Ответ сервера
      const botMessage = {
        text: res.data.content,
        isUser: false,
        isFeedback: false // Обычное сообщение от бота
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, botMessage]
            };
          }
          return chat;
        })
      );

      // Добавляем сообщение с фидбеком
      const feedbackMessage = {
        text: t('feedback.requestFeedback'),
        isUser: false,
        isFeedback: true
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, feedbackMessage]
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error(error);
      const errorMessage = {
        text: t('chatError.errorMessage'),
        isUser: false,
        isFeedback
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, errorMessage]
            };
          }
          return chat;
        })
      );
    } finally {
      setIsTyping(false);
    }
  }

  const removeFeedbackMessage = () => {
   setChats((prevChats) =>
     prevChats.map((chat) => {
       if (chat.id === currentChatId) {
         return {
           ...chat,
           messages: chat.messages.filter((message) => !message.isFeedback) // Удаляем сообщение с фидбеком
         };
       }
       return chat;
     })
   );
 };

  // Обработчик выбора кнопки
  const handleButtonClick = (value) => {
    setNarrowingFilter(value); // Сохраняем выбранное значение

    // Убираем кнопки из сообщений и помечаем чат как "не пустой"
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            isEmpty: false, // Чат больше не пустой
            showInitialButtons: false, // Скрываем кнопки
            buttonsWereHidden: true, // Фиксируем, что кнопки были скрыты
            messages: chat.messages.filter((message) => !message.isButton)
          };
        }
        return chat;
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        isTyping,
        createNewChat,
        switchChat,
        createMessage,
        handleButtonClick,
        removeFeedbackMessage,
        showInitialButtons: chats.find((c) => c.id === currentChatId)?.showInitialButtons || false
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };