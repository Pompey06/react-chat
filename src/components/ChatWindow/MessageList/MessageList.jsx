import React from 'react';
import Message from '../Message/Message';
import FeedbackMessage from '../FeeadbackMessage/FeedbackMessage';
import Header from '../../Header/Header';

export default function MessageList() {
  const messages = [
    { id: 1, text: 'Мне нужно заполнить статистическую форму', isUser: true },
    { id: 2, text: 'Хорошо, давайте уточним. Какую форму вы хотите заполнить?', isUser: false },
    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },
    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 3, text: 'Спасибо, я заполню позже', isUser: true },

    { id: 4, text: 'Понял вас! Если вам понадобится помощь, просто напишите. Хорошего дня!', isUser: false },
    { id: 5, text: 'Оцените качество ответа', isUser: false, isFeedback: true },
  ];

  return (
   <>
   <Header></Header>
    <div className="message-list flex flex-col max-h-[732px] overflow-y-auto">
{messages.map((message) =>
        message.isFeedback ? (
          <FeedbackMessage key={message.id} text={message.text} />
        ) : (
          <Message key={message.id} text={message.text} isUser={message.isUser} />
        )
      )}
    </div>
    </>
  );
}