import React, { useContext, useEffect, useRef, useState } from "react";
import Message from "../Message/Message";
import FeedbackMessage from "../FeeadbackMessage/FeedbackMessage";
import BadFeedbackRegistrationMessage from "../BadFeedbackRegistrationMessage/BadFeedbackRegistrationMessage";
import Header from "../../Header/Header";
import Sidebar from "../../Sidebar/Sidebar";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../../context/ChatContext";
import "./MessageList.css";
import TypingIndicator from "../TypingIndicator/TypingIndicator";

export default function MessageList({ isSidebarOpen, toggleSidebar }) {
   const { t } = useTranslation();
   const { chats, currentChatId, getBotMessageIndex, isTyping, handleButtonClick, showInitialButtons } =
      useContext(ChatContext);

   // Определяем текущий чат
   const currentChat = chats.find((c) => (currentChatId === null && c.id === null) || c.id === currentChatId);
   // Извлекаем сообщения текущего чата
   const messages = currentChat?.messages || [];

   const scrollTargetRef = useRef(null);
   useEffect(() => {
      if (scrollTargetRef.current) {
         scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
      }
   }, [messages]);

   const useWindowWidth = () => {
      const [windowWidth, setWindowWidth] = useState(window.innerWidth);
      useEffect(() => {
         const handleResize = () => setWindowWidth(window.innerWidth);
         window.addEventListener("resize", handleResize);
         return () => window.removeEventListener("resize", handleResize);
      }, []);
      return windowWidth;
   };

   const windowWidth = useWindowWidth();

   return (
      <div className="relative">
         <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
         {windowWidth < 700 && <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}

         <div className="overflow-y-auto message-list-wrap">
            <div className="message-list justify-end flex flex-col">
               {messages.map((message, index) => {
                  const isFirstMessage = index === 0;
                  const botMessageIndex = getBotMessageIndex(index);
                  const hasSubcategoryButtons = messages.some((msg) => msg.isButton && msg.isSubcategory);
                  const hasReportButtons = messages.some((msg) => msg.isButton && msg.isReport);
                  const hasFaqButtons = messages.some((msg) => msg.isButton && msg.isFaq);

                  return (
                     <React.Fragment key={index}>
                        {message.isFeedback ? (
                           <FeedbackMessage text={message.text} messageIndex={botMessageIndex} />
                        ) : message.badFeedbackPrompt ? (
                           // Рендер сообщения для плохого отзыва
                           <BadFeedbackRegistrationMessage currentChatId={currentChatId} />
                        ) : (
                           <>
                              <Message
                                 text={message.text}
                                 isUser={message.isUser}
                                 messageIndex={botMessageIndex}
                                 isButton={message.isButton}
                                 onClick={() => handleButtonClick(message)}
                                 filePath={message.filePath}
                              />

                              {/* Текст для начальных категорий */}
                              {isFirstMessage && showInitialButtons && (
                                 <div className="suggestion-text mt-4">{t("chat.suggestionText")}</div>
                              )}

                              {/* Текст для подкатегорий */}
                              {isFirstMessage && hasSubcategoryButtons && (
                                 <div className="suggestion-text mt-4">{t("chat.interestingSuggestion")}</div>
                              )}

                              {/* Текст для репортов */}
                              {isFirstMessage && hasReportButtons && (
                                 <div className="suggestion-text mt-4">{t("chat.interestingSuggestion")}</div>
                              )}

                              {/* Текст для FAQ вопросов */}
                              {isFirstMessage && hasFaqButtons && (
                                 <div className="suggestion-text mt-4">{t("chat.interestingSuggestion")}</div>
                              )}
                           </>
                        )}
                     </React.Fragment>
                  );
               })}

               {isTyping && <TypingIndicator text={t("chatTyping.typingMessage")} />}
               <div ref={scrollTargetRef}></div>
            </div>
         </div>
      </div>
   );
}
