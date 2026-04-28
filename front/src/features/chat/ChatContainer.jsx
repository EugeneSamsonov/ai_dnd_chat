import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import { handleApiError } from "../../utils/errorHandler";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

import "./ChatContainer.css";
// TODO Сделать разделение на GAME и OOC сообщений чтобы 50 ООС не перекрывали игровые
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
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  const fetchRoomData = async (id) => {
    if (activeTab === "OOC") {
      const { data } = await api.get(`chat/messages/?chatType=OOC`, {
        params: { room: id },
      });
      return data.results;
    } else {
      const { data } = await api.get(
        `chat/messages/?room=${id}&withParticipantsAndCharacters=true&chatType=GAME`,
      );
      return data.results;
    }
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
      <button className="open-ai-promt-modal-button">AI</button>
      <MessageInput type={activeTab} />
    </div>
  );
};

export default ChatContainer;
