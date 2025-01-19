import React from 'react';
import './SidebarButton.css'

function SidebarButton({ text, icon, onClick }) {
   return (
     <button
       onClick={onClick}
       className="flex text-xl/4 font-light sidebar__button items-center bg-white justify-between w-full"
     >
       <span>{text}</span>
       {icon && <span className="ml-2">{icon}</span>}
     </button>
   );
 }
 
 export default SidebarButton;