import React from 'react';
import './SidebarButton.css';

function SidebarButton({ text, icon, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`flex text-xl/4 font-light sidebar__button items-center justify-between w-full ${className}`}
    >
      <span>{text}</span>
      {icon && <span className="ml-2">{icon}</span>}
    </button>
  );
}

export default SidebarButton;