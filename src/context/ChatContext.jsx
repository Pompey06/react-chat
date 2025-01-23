import { createContext, useState } from 'react';
import axios from 'axios'


const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [counter, setCounter] = useState(1);

//  const messages = [
//   { id: 1, text: t('messages.userMessage1'), isUser: true },
//   { id: 2, text: t('messages.botMessage1'), isUser: false },
//   { id: 3, text: t('messages.userMessage2'), isUser: true },
//   { id: 4, text: t('messages.botMessage2'), isUser: false },
//   { id: 5, text: t('messages.feedbackPrompt'), isUser: false, isFeedback: true },
// ];

const [messages, setMessages] = useState([]);

async function createMessage(text, isFeedback = false) {
   console.log(messages, 'messages test')

   const newUserMessage = {
      text,
      isUser: true,
      isFeedback
   };
   setMessages((prev) => [...prev, newUserMessage]);
 
      await axios.post(
         `${import.meta.env.VITE_API_URL}/assistant/ask`,
         null,
         {
            params: { prompt: text }
         },
      ).then(async res => {
         const newSystemMessage = {
            text: res.data.content,
            isUser: false,
            isFeedback
         };
         //const newMessages = [...messages, newUserMessage, newSystemMessage ];
         setMessages((prev) => [...prev, newSystemMessage]);
         //setMessages(newMessages);
         console.log(messages, 'messages')
      }).catch(error => {
         //setMessages((prev) => [...prev, newUserMessage]);
         console.log('error', error);
      }).finally((res) => {
         console.log('finally', res);
      })
}



  return (
    <ChatContext.Provider 
      value={{ 
         messages,
         createMessage
      }}
   >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider};