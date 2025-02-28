import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import { useState } from "react";

function App() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   // Функция для переключения состояния боковой панели
   const toggleSidebar = () => {
      setIsSidebarOpen((prev) => !prev);
   };

   return (
      <>
         <div className="flex wrapper relative items-stretch">
            {/* Передаём состояние и функцию в Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <ChatWindow isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
         </div>
      </>
   );
}

export default App;
