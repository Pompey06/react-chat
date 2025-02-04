import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const { t, i18n } = useTranslation();

  // Создаем функцию для генерации defaultChat с учетом данных с бэкенда
  const createDefaultChat = (backendChat) => ({
    id: backendChat.id,
    title: backendChat.title,
    created_at: backendChat.created_at,
    messages: [
      {
        text: t('chat.greeting'),
        isUser: false,
        isFeedback: false,
        isButton: false,
      },
    ],
    isEmpty: true,
    showInitialButtons: true,
    buttonsWereHidden: false,
    buttonsWereShown: false,
  });

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [locale, setLocale] = useState('ru');
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка чатов при инициализации
  useEffect(() => {
    const fetchInitialChat = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversation/my`);
        const backendChat = response.data;
        
        const newChat = createDefaultChat(backendChat);
        setChats([newChat]);
        setCurrentChatId(newChat.id);
      } catch (error) {
        console.error('Error fetching initial chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialChat();
  }, []);

  // Обновляем чаты при изменении языка
  useEffect(() => {
    setChats(prevChats => 
      prevChats.map(chat => ({
        ...chat,
        messages: chat.messages.map(message => 
          message.text === chat.messages[0].text
            ? { ...message, text: t('chat.greeting') }
            : message
        )
      }))
    );
  }, [i18n.language, t]);

  useEffect(() => {
    const currentLanguage = i18n.language === 'қаз' ? 'kz' : 'ru';
    setLocale(currentLanguage);
  }, [i18n.language]);

  const updateLocale = (lang) => {
    const newLocale = lang === 'қаз' ? 'kz' : 'ru';
    setLocale(newLocale);
    i18n.changeLanguage(lang);
  };

  const fetchInitialMessages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/assistant/category-filters`);
      const messages = res.data;

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                ...messages.map((text) => ({
                  text,
                  isUser: true,
                  isFeedback: false,
                  isButton: true,
                })),
              ],
              buttonsWereShown: true,
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Ошибка при загрузке начальных сообщений:', error);
    }
  };

  useEffect(() => {
    const currentChat = chats.find((chat) => chat.id === currentChatId);

    if (currentChat && !currentChat.buttonsWereShown && !currentChat.buttonsWereHidden) {
      fetchInitialMessages();
    }
  }, [currentChatId]);

  const createNewChat = async () => {
    const currentChat = chats.find((c) => c.id === currentChatId);
    if (!currentChat) return;

    if (currentChat.isEmpty) {
      return;
    }

    const emptyChat = chats.find((c) => c.id !== currentChatId && c.isEmpty);
    if (emptyChat) {
      setCurrentChatId(emptyChat.id);
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversation/my`);
      const backendChat = response.data;
      
      const newChat = createDefaultChat(backendChat);
      setChats(prev => [...prev, newChat]);
      setCurrentChatId(newChat.id);
      
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const switchChat = (chatId) => {
    if (chatId === currentChatId) {
      return;
    }
    setCurrentChatId(chatId);
  };

  async function createMessage(text, isFeedback = false) {
    if (!currentChatId) {
      return;
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            isEmpty: false,
            showInitialButtons: false,
            buttonsWereHidden: true,
            messages: chat.messages.filter((message) => !message.isButton),
          };
        }
        return chat;
      })
    );

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
                isFeedback,
              },
            ],
          };
        }
        return chat;
      })
    );

    setIsTyping(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/assistant/ask`,
        null,
        {
          params: {
            prompt: text,
            category_filter: categoryFilter || undefined,
            locale,
            conversation_id: currentChatId,
          },
        }
      );

      const botMessage = {
        text: res.data.content,
        isUser: false,
        isFeedback: false,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, botMessage],
            };
          }
          return chat;
        })
      );

      const feedbackMessage = {
        text: t('feedback.requestFeedback'),
        isUser: false,
        isFeedback: true,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, feedbackMessage],
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
        isFeedback,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, errorMessage],
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
            messages: chat.messages.filter((message) => !message.isFeedback),
          };
        }
        return chat;
      })
    );
  };

  const handleButtonClick = (value) => {
    setCategoryFilter(value);

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            isEmpty: false,
            showInitialButtons: false,
            buttonsWereHidden: true,
            messages: chat.messages.filter((message) => !message.isButton),
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
        isLoading,
        createNewChat,
        switchChat,
        createMessage,
        handleButtonClick,
        removeFeedbackMessage,
        showInitialButtons: chats.find((c) => c.id === currentChatId)?.showInitialButtons || false,
        updateLocale,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };