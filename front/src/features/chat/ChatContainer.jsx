import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import { handleApiError } from "../../utils/errorHandler";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

import "./ChatContainer.css";

const ChatContainer = () => {
  const [activeTab, setActiveTab] = useState("GAME"); // 'GAME' или 'OOC'

  const { roomId } = useParams();
  const {
    data: messages,
    isError,
    error,
    isPending,
  } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => fetchRoomData(roomId),
    refetchInterval: 2000, 
    refetchIntervalInBackground: true, 
  });

  const fetchRoomData = async (id) => {
    const { data } = await api.get(`chat/messages`, {
      params: { room: id }, // axios автоматически превратит это в ?room=id
    });
    return data.results;
  };

  useEffect(() => {
    if (isError) {
      handleApiError(error);
    }
  }, [isError, error]);

  if (isPending) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="chat-container">
      <div className={`chat-tabs ${activeTab.toLowerCase()}`}>
        <button
          className={activeTab === "GAME" ? "active" : ""}
          onClick={() => setActiveTab("GAME")}
        >
          Игровой чат
        </button>
        <button
          className={activeTab === "OOC" ? "active" : ""}
          onClick={() => setActiveTab("OOC")}
        >
          Флуд (OOC)
        </button>
      </div>

      {/* Передаем тип чата, чтобы фильтровать сообщения */}
      <MessageList messages={messages} type={activeTab} />

      <MessageInput type={activeTab} />
    </div>
  );
};

export default ChatContainer;
