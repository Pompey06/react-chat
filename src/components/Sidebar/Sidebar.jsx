import './Sidebar.css'
import React, { useState } from 'react';
import burger from '../../assets/burger.svg';
import newChat from '../../assets/new.svg';
import previousChat from '../../assets/previous.svg'

import SidebarButton from '../SidebarButton/SidebarButton'

export default function Sidebar () {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   console.log(isDropdownOpen)

  const handleNewChat = () => {
    console.log('Создать новый чат');
  };

  const handlePreviousRequest = () => {
    console.log('Перейти в прошлый чат');
  };
   return (
   <div className={`bg-blue flex sidebar flex-col   xl:p-8 ${isDropdownOpen ? 'w-max p-8' : 'xl:min-w-96 p-3 py-[32px] min-w-[248px]'}`}>
      <img onClick={() => setIsDropdownOpen(!isDropdownOpen)} src={burger} className="sidebar__icon self-end"></img>
      <div className="sidebar__buttons flex justify-start flex-col gap-2.5 mt-16">
      {!isDropdownOpen && ( // Если isDropdownOpen === false, показываем кнопки
            <div className="sidebar__buttons flex flex-col gap-2.5">
               <SidebarButton 
                  text='Новый чат'
                  icon={<img src={newChat} alt="New Chat" className="w-5 h-5" />}
                  onClick={handleNewChat}
               />
               <SidebarButton 
                  text='Прошлый запрос'
                  icon={<img src={previousChat} alt="Previous Chat" className="w-5 h-5" />}
                  onClick={handlePreviousRequest}
               />
               <SidebarButton 
                  text='Прошлый запрос'
                  icon={<img src={previousChat} alt="Previous Chat" className="w-5 h-5" />}
                  onClick={handlePreviousRequest}
               />
            </div>
         )}
      </div>
   </div>
   );
 };
 