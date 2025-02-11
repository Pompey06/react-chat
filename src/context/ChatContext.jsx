import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { hasFeedback, saveFeedbackState } from '../utils/feedbackStorage';

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

  const fetchChatHistory = async (chatId) => {
   try {
     const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversation/by-id/${chatId}`);
     
     const formattedMessages = response.data.messages.map(message => ({
       text: message.text,
       isUser: message.type === "user",
       isFeedback: false,
       isButton: false
     }));
 
     const messagesWithFeedback = [];
     formattedMessages.forEach((message, index) => {
       messagesWithFeedback.push(message);
       
       // Добавляем фидбек только если:
       // 1. Сообщение от ассистента
       // 2. Фидбек ещё не был отправлен
       if (!message.isUser && !hasFeedback(chatId, index)) {
         messagesWithFeedback.push({
           text: t('feedback.requestFeedback'),
           isUser: false,
           isFeedback: true,
           isButton: false
         });
       }
     });
 
     return {
       ...response.data,
       messages: messagesWithFeedback
     };
   } catch (error) {
     console.error('Error fetching chat history:', error);
     throw error;
   }
 };
 
 const fetchMyChats = async () => {
   try {
     const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversation/my`);
     return response.data;
   } catch (error) {
     console.error('Error fetching my chats:', error);
     throw error;
   }
 };


 useEffect(() => {
   const loadExistingChats = async () => {
     try {
       const myChats = await fetchMyChats();
       setChats(prevChats => {
         // Оставляем текущий дефолтный чат и добавляем существующие
         const defaultChat = prevChats.find(chat => chat.id === null);
         return [
           defaultChat,
           ...myChats.map(chat => ({
             ...createDefaultChat(),
             id: chat.id,
             title: chat.title,
             isEmpty: false,
           }))
         ];
       });
     } catch (error) {
       console.error('Error loading existing chats:', error);
     }
   };
 
   loadExistingChats();
 }, []);

 const fetchInitialMessages = async () => {
   try {
     const res = await axios.get(`${import.meta.env.VITE_API_URL}/assistant/category-filters`);
     const messages = res.data;
 
     setChats((prev) =>
       prev.map((chat) => {
         if (chat.isEmpty && (String(chat.id) === String(currentChatId) || (chat.id === null && currentChatId === null))) {
           return {
             ...chat,
             messages: [
               chat.messages[0], // Сохраняем приветственное сообщение
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
 
 // Обновляем useEffect для отслеживания переключения чатов
 useEffect(() => {
   const currentChat = chats.find((c) => 
     String(c.id) === String(currentChatId) || (c.id === null && currentChatId === null)
   );
 
   // Загружаем кнопки только если чат пустой и кнопки ещё не были загружены
   if (currentChat?.isEmpty && !currentChat.buttonsWereShown) {
     fetchInitialMessages();
   }
 }, [currentChatId]);

 const createNewChat = () => {
   // Находим текущий чат
   const currentChat = chats.find((c) => String(c.id) === String(currentChatId));
   
   // Если мы в пустом чате - перезагружаем его состояние
   if (currentChat?.isEmpty) {
     setChats(prev => 
       prev.map(chat => {
         if (chat.isEmpty) {
           return {
             ...createDefaultChat(),
             id: null,
             isEmpty: true,
             buttonsWereShown: false,
           };
         }
         return chat;
       })
     );
     fetchInitialMessages(); // Добавляем явный вызов
     return;
   }
 
   // Находим существующий пустой чат
   const emptyChat = chats.find((c) => c.isEmpty);
 
   // Если есть пустой чат - переключаемся на него и перезагружаем кнопки
   if (emptyChat) {
     setCurrentChatId(null);
     setChats(prev => 
       prev.map(chat => {
         if (chat.isEmpty) {
           return {
             ...createDefaultChat(),
             id: null,
             isEmpty: true,
             buttonsWereShown: false,
           };
         }
         return chat;
       })
     );
     fetchInitialMessages(); // Добавляем явный вызов
     return;
   }
 
   // Если нет пустого чата - создаём новый
   const newChat = createDefaultChat();
   setChats(prev => [...prev, newChat]);
   setCurrentChatId(null);
   fetchInitialMessages(); // Добавляем явный вызов
 };

 const switchChat = async (chatId) => {
   if (String(chatId) === String(currentChatId)) {
     return;
   }
 
   try {
     if (chatId !== null) {
       const chatHistory = await fetchChatHistory(chatId);
       
       setChats(prevChats => prevChats.map(chat => {
         if (String(chat.id) === String(chatId)) {
           return {
             ...chat,
             messages: [
               // Сохраняем приветственное сообщение
               chat.messages[0],
               ...chatHistory.messages
             ],
             title: chatHistory.title,
             isEmpty: false,
             showInitialButtons: false,
             buttonsWereHidden: true
           };
         }
         return chat;
       }));
     }
     
     setCurrentChatId(chatId);
   } catch (error) {
     console.error('Error switching chat:', error);
   }
 };

 async function createMessage(text, isFeedback = false) {
   if (!text) return;
 
   const currentChat = chats.find(
     (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
   );
 
   const params = {
     prompt: text,
     category_filter: categoryFilter || '',
     locale,
   };
 
   if (currentChat && currentChat.id) {
     params.conversation_id = currentChat.id;
   }
 
   setIsTyping(true);
 
   try {
     // Добавляем сообщение пользователя
     setChats((prev) =>
       prev.map((chat) => {
         if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
           return {
             ...chat,
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
 
     // Если это первое сообщение в чате
     if (!currentChatId) {
       setCurrentChatId(conversationId);
     }

     const filePath =
           res.data.match_items?.find(item => item.data?.path)?.data?.path || null;
 
     // Добавляем ответ бота и обновляем информацию о чате
     setChats((prev) =>
       prev.map((chat) => {
         if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
           const chatId = chat.id || conversationId;
           const newBotMessageIndex = chat.messages.length + 1; // +1 потому что мы уже добавили сообщение пользователя
           



           const messages = [
             ...chat.messages,
             {
               text: res.data.content,
               isUser: false,
               isFeedback: false,
               filePath,
             }
           ];
 
           // Добавляем фидбек только если он ещё не был отправлен
           if (!hasFeedback(chatId, newBotMessageIndex)) {
             messages.push({
               text: t('feedback.requestFeedback'),
               isUser: false,
               isFeedback: true,
             });
           }
 
           return {
             ...chat,
             id: chatId,
             title: chat.title || conversationTitle,
             isEmpty: false,
             showInitialButtons: false,
             buttonsWereHidden: true,
             messages,
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

 const handleButtonClick = (value) => {
   setCategoryFilter(value);
 
   setChats((prev) =>
     prev.map((chat) => {
       if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
         return {
           ...chat,
           showInitialButtons: false,
           buttonsWereHidden: true,
           messages: [
             chat.messages[0], // Сохраняем приветственное сообщение
             ...chat.messages.slice(1).filter((message) => !message.isButton), // Удаляем кнопки
           ],
         };
       }
       return chat;
     })
   );
 };


const removeFeedbackMessage = (messageIndex) => {
  setChats(prevChats => 
    prevChats.map(chat => {
      if (chat.id === currentChatId || (chat.id === null && currentChatId === null)) {
        return {
          ...chat,
          messages: chat.messages.filter((msg, index) => {
            // Если это сообщение фидбека для конкретного индекса - удаляем его
            if (msg.isFeedback) {
              const botMessageIndex = getBotMessageIndex(index, chat.messages);
              return botMessageIndex !== messageIndex;
            }
            return true;
          })
        };
      }
      return chat;
    })
  );
};

const getBotMessageIndex = (currentIndex) => {
   const currentChat = chats.find(c => 
     String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
   );
   
   if (!currentChat) return null;
   
   const messages = currentChat.messages;
   
   if (!messages[currentIndex]?.isFeedback) {
     return null;
   }

   // Пропускаем первое приветственное сообщение
   let messageCount = -1; // Начинаем с -1, чтобы первая пара начиналась с 0
   
   for (let i = 1; i < currentIndex; i++) { // Начинаем с 1, пропуская приветствие
     const message = messages[i];
     
     // Пропускаем фидбек сообщения
     if (message.isFeedback) {
       continue;
     }
     
     messageCount++;
   }

   // Возвращаем индекс бота (каждый второй индекс)
   return Math.floor(messageCount / 2) * 2 + 1;
};

const sendFeedback = async (rate, text, messageIndex) => {
   try {
     const currentChat = chats.find(c => 
       String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
     );
     if (!currentChat) throw new Error('Chat not found');
 
     const response = await axios.post(
       `${import.meta.env.VITE_API_URL}/conversation/by-id/${currentChat.id}/add-feedback`,
       {
         message_index: messageIndex,
         rate: rate,
         text: text
       }
     );
 
     // Сохраняем информацию об отправленном фидбеке
     saveFeedbackState(currentChat.id, messageIndex);
 
     // Удаляем сообщение с фидбеком из чата
     removeFeedbackMessage(messageIndex);
     
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
        sendFeedback,
        getBotMessageIndex,
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