import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const { t, i18n } = useTranslation();

  const createDefaultChat = () => ({
    id: null,
    title: null,
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

  const [chats, setChats] = useState(() => [createDefaultChat()]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [locale, setLocale] = useState('ru');

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
          if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
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
    const currentChat = currentChatId 
      ? chats.find((chat) => String(chat.id) === String(currentChatId))
      : chats[0];

    if (currentChat && !currentChat.buttonsWereShown && !currentChat.buttonsWereHidden) {
      fetchInitialMessages();
    }
  }, [currentChatId]);

  const createNewChat = () => {
    const currentChat = chats.find((c) => String(c.id) === String(currentChatId));
    if (!currentChat) return;

    if (currentChat.isEmpty) {
      return;
    }

    const emptyChat = chats.find((c) => String(c.id) !== String(currentChatId) && c.isEmpty);
    if (emptyChat) {
      setCurrentChatId(emptyChat.id);
      return;
    }

    const newChat = createDefaultChat();
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(null);
  };

  const switchChat = (chatId) => {
    if (String(chatId) === String(currentChatId)) {
      return;
    }
    setCurrentChatId(chatId);
  };

  async function createMessage(text, isFeedback = false) {
    if (!text) return;

    // Находим текущий чат до отправки запроса
    const currentChat = chats.find(
      (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
    );

    console.log('Current chat state:', {
      chatId: currentChat?.id,
      currentChatId,
      messages: currentChat?.messages,
      allChats: chats
  });

    // Формируем параметры запроса
    const params = {
      prompt: text,
      category_filter: categoryFilter || '',
      locale,
    };

    // Если у чата уже есть ID, добавляем его в параметры
    if (currentChat && currentChat.id) {
      params.conversation_id = currentChat.id;
    }

    console.log('Отправляемые параметры:', {
      currentChatId,
      params,
      currentChat: currentChat?.id
    });

    setIsTyping(true);

    try {
      // Добавляем сообщение пользователя в чат
      setChats((prev) =>
        prev.map((chat) => {
          if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
            return {
              ...chat,
              isEmpty: false,
              showInitialButtons: false,
              buttonsWereHidden: true,
              messages: [
                ...chat.messages.filter((message) => !message.isButton),
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

      // Отправляем запрос
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/assistant/ask`,
        null,
        { params }
      );

      const conversationId = res.data.conversation_id;
      const conversationTitle = res.data.conversation_title;

      // Обновляем ID текущего чата только если его еще нет
      if (!currentChatId) {
        setCurrentChatId(conversationId);
      }

      // Добавляем ответ бота
      setChats((prev) =>
        prev.map((chat) => {
          if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
            return {
              ...chat,
              id: chat.id || conversationId, // Сохраняем существующий ID или устанавливаем новый
              title: chat.title || conversationTitle,
              messages: [
                ...chat.messages,
                {
                  text: res.data.content,
                  isUser: false,
                  isFeedback: false,
                },
              ],
            };
          }
          return chat;
        })
      );

      // Добавляем сообщение с запросом фидбека
      const feedbackMessage = {
        text: t('feedback.requestFeedback'),
        isUser: false,
        isFeedback: true,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (String(chat.id) === String(conversationId)) {
            return {
              ...chat,
              messages: [...chat.messages, feedbackMessage],
            };
          }
          return chat;
        })
      );

    } catch (error) {
      console.error('Детали ошибки:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        params: error.config?.params,
        url: error.config?.url
      });
      
      const errorMessage = {
        text: t('chatError.errorMessage'),
        isUser: false,
        isFeedback,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
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
        if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prevChats[0])) {
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
        if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
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

  const getBotMessageIndex = (chatId) => {
    const chat = chats.find(c => String(c.id) === String(chatId) || (c.id === null && c === chats[0]));
    if (!chat) return 0;
  
    const messages = chat.messages;
    let botCount = 0;
  
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.isUser && !msg.isFeedback) {
        botCount++;
      }
    }
  
    return botCount - 1;
  };
 
  const sendFeedback = async (rate, text) => {
    try {
      const currentChat = chats.find(c => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0]));
      if (!currentChat) throw new Error('Chat not found');

      const botMessageIndex = getBotMessageIndex(currentChatId);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/conversation/by-id/${currentChat.id}/add-feedback`,
        {
          message_index: botMessageIndex,
          rate: rate,
          text: text
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw error;
    }
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
        getBotMessageIndex,
        sendFeedback,
        removeFeedbackMessage,
        showInitialButtons: chats.find((c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0]))?.showInitialButtons || false,
        updateLocale,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };