import "./Sidebar.css";
import React, { useState, useEffect, useContext } from "react";
import burger from "../../assets/burger.svg";
import newBurgerIcon from "../../assets/newBurgerIcon.svg";
import logo from "../../assets/logo.png";
import newChat from "../../assets/new.svg";
import newPlusIcon from "../../assets/newPlusIcon.svg";
import previousChat from "../../assets/previous.svg";
import newPreviousChat from "../../assets/previousChat.svg";
import SidebarButton from "../SidebarButton/SidebarButton";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../context/ChatContext";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
   const { t } = useTranslation();
   const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
   const { chats, currentChatId, createNewChat, switchChat } = useContext(ChatContext);

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth < 700);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   const handleNewChat = () => {
      createNewChat();
      if (isMobile) {
         toggleSidebar();
      }
   };

   const handleSwitchChat = (chatId) => {
      switchChat(chatId);
      if (isMobile) {
         toggleSidebar();
      }
   };

   return (
      <div
         className={`sidebar overflow-hidden flex xl:p-8 flex-col ${
            isSidebarOpen ? "sidebar--close p-8" : "xl:min-w-96 p-3 py-[32px] min-w-[248px]"
         }`}
      >
         <div className="sidebar__top flex justify-between items-start gap-2.5">
            <img src={logo} alt="logo" className="sidebar__logo" />
            <p className="logo__text">{t("logo.text")}</p>
            <img
               onClick={toggleSidebar}
               src={newBurgerIcon}
               className="sidebar__icon self-end cursor-pointer"
               alt={t("sidebar.close")}
            />
         </div>

         {/* Убираем условие рендеринга, теперь управляем через CSS */}
         <div className="sidebar__buttons flex justify-start flex-col gap-2.5 mt-16">
            {[
               {
                  id: "new-chat",
                  text: t("sidebar.newChat"),
                  icon: <img src={newPlusIcon} alt={t("sidebar.newChat")} className="w-5 h-5" />,
                  onClick: handleNewChat,
                  className: "bg-white",
               },
               ...chats
                  .slice()
                  .reverse()
                  .map((chat, index) => ({
                     id: chat.id,
                     text: chat.title || t("sidebar.newChat"),
                     icon: <img src={newPreviousChat} alt={t("sidebar.previousRequest")} className="w-5 h-5" />,
                     onClick: () => handleSwitchChat(chat.id),
                     className: `py-2 px-4 rounded-md ${
                        chat.id === currentChatId ? "bg-gray-300 text-black _active" : "bg-white text-gray-600"
                     }`,
                  })),
            ].map((button) => (
               <SidebarButton
                  key={button.id}
                  text={button.text}
                  icon={button.icon}
                  onClick={button.onClick}
                  className={button.className}
               />
            ))}
         </div>
      </div>
   );
}
