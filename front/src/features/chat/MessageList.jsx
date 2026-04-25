import { useEffect, useRef } from "react";

import "./MessageList.css";

const MessageList = ({ messages, type }) => {
  const messagesEndRef = useRef(null);

  // Фильтруем сообщения по типу (GAME или OOC)
  const filteredMessages = messages
    .filter((msg) => msg.chat_type === type)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Срабатывает каждый раз, когда список отфильтрованных сообщений обновляется
  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

//   console.log(filteredMessages);

  return (
    <div className="messages-list">
      {filteredMessages.map((msg) => (
        <div
          key={msg.id}
          className={`message-item ${msg.chat_type.toLowerCase()} ${msg.participant?.role.toLowerCase()}`}
        >
          {type === "OOC" ? (
            <span className="author">{msg.sender.username}:</span>
          ) : (
            <span className="author">
              {msg.participant?.role === "DM"
                ? "ДМ " + msg.sender.username
                : msg.participant?.character?.name}
              :
            </span>
          )}

          <p className="text">{msg.text}</p>
          <span className="time">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}

      {/* Тот самый якорь для скролла */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
