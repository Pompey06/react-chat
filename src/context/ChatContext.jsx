import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
   hasFeedback,
   saveFeedbackState,
   hasBadFeedbackPrompt,
   saveBadFeedbackPromptState,
   getFilePaths,
   saveFilePath,
   getFilePathByBotIndex,
} from "../utils/feedbackStorage";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
   const { t, i18n } = useTranslation();
   const [translationsKz, setTranslationsKz] = useState({});
   const [categories, setCategories] = useState([]);
   const [currentCategory, setCurrentCategory] = useState(null);
   const [currentSubcategory, setCurrentSubcategory] = useState(null);

   const createDefaultChat = () => ({
      id: null,
      title: null,
      messages: [
         {
            text: t("chat.greeting"),
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
   const [locale, setLocale] = useState("ru");

   useEffect(() => {
      setChats((prevChats) =>
         prevChats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((message) =>
               message.text === chat.messages[0].text ? { ...message, text: t("chat.greeting") } : message
            ),
         }))
      );
   }, [i18n.language, t]);

   useEffect(() => {
      const currentLanguage = i18n.language === "қаз" ? "kz" : "ru";
      setLocale(currentLanguage);
   }, [i18n.language]);

   const updateLocale = (lang) => {
      const newLocale = lang === "қаз" ? "kz" : "ru";
      setLocale(newLocale);
      i18n.changeLanguage(lang);
   };

   const fetchChatHistory = async (chatId) => {
      try {
         const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversation/by-id/${chatId}`);

         const formattedMessages = response.data.messages.map((message) => ({
            text: message.text,
            isUser: message.type === "user",
            isFeedback: false,
            isButton: false,
         }));

         const messagesWithFeedback = [];

         const savedFilePaths = getFilePaths(chatId);

         let botIndex = 0;
         formattedMessages.forEach((message, index) => {
            if (!message.isUser) {
               // Получаем filePath по индексу бота
               const filePath = getFilePathByBotIndex(chatId, botIndex);
               if (filePath) {
                  message.filePath = filePath;
               }
               botIndex++;
            }

            messagesWithFeedback.push(message);
            // Добавляем filePath из localStorage, если он есть для сообщения от бота
            if (!message.isUser && savedFilePaths[index]) {
               message.filePath = savedFilePaths[index];
            }

            // Добавляем фидбек только если:
            // 1. Сообщение от ассистента
            // 2. Фидбек ещё не был отправлен
            if (!message.isUser && !hasFeedback(chatId, index)) {
               messagesWithFeedback.push({
                  text: t("feedback.requestFeedback"),
                  isUser: false,
                  isFeedback: true,
                  isButton: false,
               });
            }
         });

         if (hasBadFeedbackPrompt(chatId)) {
            messagesWithFeedback.push({
               text: t("feedback.badFeedbackPromptText"),
               isUser: false,
               isFeedback: false,
               badFeedbackPrompt: true,
            });
         }

         return {
            ...response.data,
            messages: messagesWithFeedback,
         };
      } catch (error) {
         console.error("Error fetching chat history:", error);
         throw error;
      }
   };

   const fetchMyChats = async () => {
      try {
         const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversation/my`);
         return response.data;
      } catch (error) {
         console.error("Error fetching my chats:", error);
         throw error;
      }
   };

   useEffect(() => {
      const loadExistingChats = async () => {
         try {
            const myChats = await fetchMyChats();
            setChats((prevChats) => {
               // Оставляем текущий дефолтный чат и добавляем существующие
               const defaultChat = prevChats.find((chat) => chat.id === null);
               return [
                  defaultChat,
                  ...myChats.map((chat) => ({
                     ...createDefaultChat(),
                     id: chat.id,
                     title: chat.title,
                     isEmpty: false,
                  })),
               ];
            });
         } catch (error) {
            console.error("Error loading existing chats:", error);
         }
      };

      loadExistingChats();
   }, []);

   const fetchInitialMessages = async () => {
      // Проверяем, есть ли у нас уже загруженные категории
      if (categories.length > 0) {
         updateChatWithExistingCategories();
         return;
      }

      try {
         const res = await axios.get(`${import.meta.env.VITE_API_URL}/assistant/categories`);
         const fetchedCategories = res.data.categories;
         setCategories(fetchedCategories);
         setTranslationsKz(res.data.translations_kz || {});

         updateChatWithCategories(fetchedCategories);
      } catch (error) {
         console.error("Ошибка при загрузке начальных сообщений:", error);
      }
   };

   const updateChatWithCategories = (fetchedCategories) => {
      setChats((prev) =>
         prev.map((chat) => {
            if (
               chat.isEmpty &&
               (String(chat.id) === String(currentChatId) || (chat.id === null && currentChatId === null))
            ) {
               return {
                  ...chat,
                  messages: [
                     chat.messages[0],
                     ...fetchedCategories.slice(0, 4).map((cat) => ({
                        text: locale === "ru" ? cat.name : translationsKz[cat.name] || cat.name,
                        isUser: true,
                        isFeedback: false,
                        isButton: true,
                        category: cat,
                     })),
                  ],
                  buttonsWereShown: true,
               };
            }
            return chat;
         })
      );
   };

   const updateChatWithExistingCategories = () => {
      setChats((prev) =>
         prev.map((chat) => {
            if (
               chat.isEmpty &&
               (String(chat.id) === String(currentChatId) || (chat.id === null && currentChatId === null))
            ) {
               const categoryButtons = categories.slice(0, 4).map((cat) => ({
                  text: locale === "ru" ? cat.name : translationsKz[cat.name] || cat.name,
                  isUser: true,
                  isFeedback: false,
                  isButton: true,
                  name: cat.name,
                  category: cat,
                  subcategories: cat.subcategories,
                  faq: cat.faq,
               }));

               return {
                  ...chat,
                  messages: [chat.messages[0], ...categoryButtons],
                  buttonsWereShown: true,
               };
            }
            return chat;
         })
      );
   };

   useEffect(() => {
      if (currentChatId === null) {
         /* Temporarily commented out subcategory and category handling
         if (currentSubcategory) {
            // Если есть выбранная подкатегория, показываем её reports
            handleButtonClick({
               ...currentSubcategory,
               subcategory: true,
               category: currentCategory,
            });
         } else if (currentCategory) {
            // Если есть только категория, показываем её содержимое
            handleButtonClick(currentCategory);
         } else 
         */
         if (categories.length > 0) {
            // Если ничего не выбрано, показываем начальные категории
            updateChatWithExistingCategories();
         }
      }
   }, [i18n.language]);

   // Обновляем useEffect для отслеживания переключения чатов
   useEffect(() => {
      const currentChat = chats.find(
         (c) => String(c.id) === String(currentChatId) || (c.id === null && currentChatId === null)
      );

      // Загружаем кнопки только если чат пустой и кнопки ещё не были загружены
      if (currentChat?.isEmpty && !currentChat.buttonsWereShown) {
         fetchInitialMessages();
      }
   }, [currentChatId]);

   const createNewChat = () => {
      setCurrentCategory(null);
      setCurrentSubcategory(null);
      setCategoryFilter(null);
      // Находим текущий чат
      const currentChat = chats.find((c) => String(c.id) === String(currentChatId));

      // Если мы в пустом чате - перезагружаем его состояние
      if (currentChat?.isEmpty) {
         setChats((prev) =>
            prev.map((chat) => {
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
         setChats((prev) =>
            prev.map((chat) => {
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
      setChats((prev) => [...prev, newChat]);
      setCurrentChatId(null);
      fetchInitialMessages(); // Добавляем явный вызов
   };

   const switchChat = async (chatId) => {
      setCurrentCategory(null);
      setCurrentSubcategory(null);
      setCategoryFilter(null);
      if (String(chatId) === String(currentChatId)) {
         return;
      }

      try {
         if (chatId !== null) {
            const chatHistory = await fetchChatHistory(chatId);

            setChats((prevChats) =>
               prevChats.map((chat) => {
                  if (String(chat.id) === String(chatId)) {
                     return {
                        ...chat,
                        messages: [
                           // Сохраняем приветственное сообщение
                           chat.messages[0],
                           ...chatHistory.messages,
                        ],
                        title: chatHistory.title,
                        isEmpty: false,
                        showInitialButtons: false,
                        buttonsWereHidden: true,
                     };
                  }
                  return chat;
               })
            );
         }

         setCurrentChatId(chatId);
      } catch (error) {
         console.error("Error switching chat:", error);
      }
   };

   async function createMessage(text, isFeedback = false, additionalParams = {}) {
      if (!text) return;

      const currentChat = chats.find(
         (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
      );

      // Формируем параметры запроса
      const params = {
         prompt: text,
         locale,
         category: currentCategory?.name || null,
         subcategory: null, // Временно всегда null
         subcategory_report: null, // Временно всегда null
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

         const formatBotResponse = (text) => {
            // Не заменяем \n на <br />, а просто добавляем флаг
            return {
               text: text,
               hasLineBreaks: text.includes("\n"),
            };
         };

         // Отправляем запрос с новыми параметрами
         const res = await axios.post(`${import.meta.env.VITE_API_URL}/assistant/ask`, null, { params });

         // Получаем данные из ответа
         const conversationId = res.data.conversation_id;
         const conversationTitle = res.data.conversation_title;

         if (!currentChatId) {
            setCurrentChatId(conversationId);
         }

         const filePath =
            res.data.match_items?.find((item) => {
               const path = item.data?.path;
               return path && path.toLowerCase().endsWith(".pdf");
            })?.data?.path || null;

         const formattedResponse = formatBotResponse(res.data.content);

         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const chatId = chat.id || conversationId;
                  const newBotMessageIndex = chat.messages.length;

                  let botCount = 0;
                  chat.messages.forEach((msg) => {
                     if (!msg.isUser && !msg.isFeedback) botCount++;
                  });
                  // Сохраняем filePath в localStorage, если он есть
                  if (filePath) {
                     saveFilePath(chatId, botCount, filePath);
                  }

                  const messages = [
                     ...chat.messages,
                     {
                        text: formattedResponse.text,
                        isUser: false,
                        isFeedback: false,
                        filePath,
                        hasLineBreaks: formattedResponse.hasLineBreaks,
                     },
                  ];

                  if (!hasFeedback(chatId, newBotMessageIndex)) {
                     messages.push({
                        text: t("feedback.requestFeedback"),
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
         console.error("Детали ошибки:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            params: error.config?.params,
            url: error.config?.url,
         });

         const errorMessage = {
            text: t("chatError.errorMessage"),
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

   const handleButtonClick = (selectedItem) => {
      console.log("Selected item:", selectedItem);

      // Set the current category
      const categoryData = selectedItem.category || selectedItem;
      setCategoryFilter(categoryData.name);
      setCurrentCategory(categoryData);

      // Show FAQ questions immediately after selecting a category
      if (categoryData.faq && categoryData.faq.length > 0) {
         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const faqButtons = categoryData.faq.map((faq) => ({
                     text:
                        locale === "ru"
                           ? faq.question
                           : (translationsKz && translationsKz[faq.question]) || faq.question,
                     isUser: true,
                     isFeedback: false,
                     isButton: true,
                     isFaq: true,
                     faqData: faq,
                  }));

                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     messages: [chat.messages[0], ...faqButtons],
                  };
               }
               return chat;
            })
         );
      } else {
         // If no FAQ is available, just hide the buttons
         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     // Keep only the welcome message, remove all buttons
                     messages: [chat.messages[0]],
                  };
               }
               return chat;
            })
         );
      }

      /* 
      // TEMPORARILY COMMENTED OUT - Subcategory handling
      if (selectedItem?.subcategories || selectedItem?.category?.subcategories) {
         const categoryData = selectedItem.category || selectedItem;
         setCategoryFilter(categoryData.name);
         setCurrentCategory(categoryData);

         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const subcategoryButtons = categoryData.subcategories.map((subcat) => ({
                     text:
                        locale === "ru" ? subcat.name : (translationsKz && translationsKz[subcat.name]) || subcat.name,
                     isUser: true,
                     isFeedback: false,
                     isButton: true,
                     isSubcategory: true,
                     name: subcat.name,
                     reports: subcat.reports,
                  }));

                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     messages: [chat.messages[0], ...subcategoryButtons],
                  };
               }
               return chat;
            })
         );
         return;
      }

      // TEMPORARILY COMMENTED OUT - Subcategory reports handling
      if (selectedItem?.isSubcategory && selectedItem?.reports) {
         setCurrentSubcategory(selectedItem);
         setCategoryFilter(selectedItem.name);

         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const reportButtons = selectedItem.reports.map((report) => ({
                     text: locale === "ru" ? report : (translationsKz && translationsKz[report]) || report,
                     isUser: true,
                     isFeedback: false,
                     isButton: true,
                     isReport: true,
                     reportText: report,
                  }));

                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     messages: [chat.messages[0], ...reportButtons],
                  };
               }
               return chat;
            })
         );
         return;
      }

      // TEMPORARILY COMMENTED OUT - Report handling
      if (selectedItem?.isReport) {
         if (currentCategory?.faq) {
            setChats((prev) =>
               prev.map((chat) => {
                  if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                     const faqButtons = currentCategory.faq.map((faq) => ({
                        text:
                           locale === "ru"
                              ? faq.question
                              : (translationsKz && translationsKz[faq.question]) || faq.question,
                        isUser: true,
                        isFeedback: false,
                        isButton: true,
                        isFaq: true,
                        faqData: faq,
                        selectedReport: selectedItem.reportText,
                     }));

                     return {
                        ...chat,
                        showInitialButtons: false,
                        buttonsWereHidden: true,
                        messages: [chat.messages[0], ...faqButtons],
                     };
                  }
                  return chat;
               })
            );
         }
         return;
      }
      */

      // Handle FAQ question selection
      if (selectedItem?.isFaq) {
         createMessage(selectedItem.text, false, {
            category: currentCategory?.name,
            subcategory: null,
            subcategory_report: null,
         });
         return;
      }
   };

   const removeFeedbackMessage = (messageIndex) => {
      setChats((prevChats) =>
         prevChats.map((chat) => {
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
                  }),
               };
            }
            return chat;
         })
      );
   };

   const getBotMessageIndex = (currentIndex) => {
      const currentChat = chats.find(
         (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
      );

      if (!currentChat) return null;

      const messages = currentChat.messages;

      if (!messages[currentIndex]?.isFeedback) {
         return null;
      }

      // Пропускаем первое приветственное сообщение
      let messageCount = -1; // Начинаем с -1, чтобы первая пара начиналась с 0

      for (let i = 1; i < currentIndex; i++) {
         // Начинаем с 1, пропуская приветствие
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
         const currentChat = chats.find(
            (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
         );
         if (!currentChat) throw new Error("Chat not found");

         const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/conversation/by-id/${currentChat.id}/add-feedback`,
            {
               message_index: messageIndex,
               rate: rate,
               text: text,
            }
         );

         // Сохраняем информацию об отправленном фидбеке
         saveFeedbackState(currentChat.id, messageIndex);

         // Удаляем сообщение с фидбеком из чата
         removeFeedbackMessage(messageIndex);

         // Если пользователь отправил плохой отзыв, добавляем сообщение для регистрации
         if (rate === "bad") {
            saveBadFeedbackPromptState(currentChat.id);
            setChats((prevChats) =>
               prevChats.map((chat) => {
                  if (String(chat.id) === String(currentChatId) || (chat.id === null && currentChatId === null)) {
                     return {
                        ...chat,
                        messages: [
                           ...chat.messages,
                           {
                              text: t("feedback.badFeedbackPromptText"), // "Для регистрации заполните форму ниже"
                              isUser: false,
                              isFeedback: false,
                              badFeedbackPrompt: true, // флаг для рендера нового компонента
                           },
                        ],
                     };
                  }
                  return chat;
               })
            );
         }

         return response.data;
      } catch (error) {
         console.error("Error sending feedback:", error);
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
            showInitialButtons:
               chats.find((c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0]))
                  ?.showInitialButtons || false,
            updateLocale,
         }}
      >
         {children}
      </ChatContext.Provider>
   );
};

export { ChatContext, ChatProvider };
