// ChatContext.jsx
import { createContext, useState } from 'react';
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
    messages: []
  };

  const [chats, setChats] = useState([defaultChat]);
  const [currentChatId, setCurrentChatId] = useState(defaultChat.id);

  // Показывать "печатает..." во время запроса к серверу
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Создаём новый чат, не допуская двух пустых.
   * Если текущий чат пуст — не создаём новый.
   * Если существует другой пустой чат — переходим на него.
   * Иначе создаём новый.
   */
  const createNewChat = () => {
    const currentChat = chats.find((c) => c.id === currentChatId);
    if (!currentChat) return;

    // Если текущий чат пуст — ничего не делаем
    if (currentChat.messages.length === 0) {
      console.log('Текущий чат уже пуст, новый не создаём.');
      return;
    }

    // Если есть другой пустой чат
    const emptyChat = chats.find(
      (c) => c.id !== currentChatId && c.messages.length === 0
    );
    if (emptyChat) {
      setCurrentChatId(emptyChat.id);
      console.log('Переключаемся на существующий пустой чат.');
      return;
    }

    // Иначе создаём новый
    const newChat = {
      id: generateId(),
      messages: []
    };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  const switchChat = (chatId) => {
   // Если уже на этом чате — выходим
   if (chatId === currentChatId) {
     console.log("Уже в этом чате, ничего не делаем");
     return;
   }
 
   setCurrentChatId(chatId);
 };
  // Добавляем сообщение (сначала пользовательское, потом ответ сервера)
  async function createMessage(text, isFeedback = false) {
    if (!currentChatId) {
      console.log('Нет активного чата. Сообщение не создаётся.');
      return;
    }

    // 1) Добавляем сообщение пользователя
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
          params: { prompt: text }
        }
      );

      // Ответ сервера
      const botMessage = {
        text: res.data.content,
        isUser: false,
        isFeedback
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
    } catch (error) {
      console.error(error);
      // При ошибке
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
      // Скрываем "печатает..."
      setIsTyping(false);
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        isTyping,
        createNewChat,
        switchChat,
        createMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };