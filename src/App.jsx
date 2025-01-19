import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import ChatWindow from "./components/ChatWindow/ChatWindow";

function App() {
  return (
   <>
<div className='flex relative items-stretch px-6 py-[50px] lg:p-16 gap-10 xl:gap-20'>
      <Sidebar></Sidebar>
      <ChatWindow>

      </ChatWindow>
</div>
   </>
  )
}

export default App
