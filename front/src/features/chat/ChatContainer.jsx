import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutationState } from "@tanstack/react-query";

import api from "../../api/axios";
import { handleApiError } from "../../utils/errorHandler";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import AksAIModal from "./AskAIModal";

import "./ChatContainer.css";

const ChatContainer = () => {
  const [activeTab, setActiveTab] = useState("GAME"); // 'GAME' или 'OOC'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { roomId } = useParams();
  const {
    data: messages,
    isError,
    error,
    isPending,
  } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => fetchRoomData(roomId),
    refetchInterval: 3000,
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

  // Вытаскиваем состояние всех мутаций с нашим ключом из глобального кэша
  const aiMutationStates = useMutationState({
    filters: { mutationKey: ["ask-ai", roomId] },
    select: (mutation) => ({
      status: mutation.state.status, // "pending", "success", "error"
      data: mutation.state.data,     // Тот самый ответ от бэка (response.data)
      error: mutation.state.error,
    }),
  });

  // Получаем состояние самой последней запущенной мутации ИИ
  const lastAiRequest = aiMutationStates[aiMutationStates.length - 1];

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
      <button className="open-ai-promt-modal-button" onClick={() => {setIsModalOpen(true)}}>AI</button>
      <MessageInput type={activeTab} />

      <AksAIModal
        isOpen={isModalOpen}
        data={lastAiRequest?.data}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ChatContainer;
