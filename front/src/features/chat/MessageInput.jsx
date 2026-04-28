import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import api from "../../api/axios";
import { handleApiError } from "../../utils/errorHandler";

import "./MessageInput.css";
import { toast } from "react-toastify";

const MessageInput = ({ type, participant }) => {
  const [messageText, setMessageText] = useState("");

  const queryClient = useQueryClient();

  const roomId = useParams().roomId;

  const textareaRef = useRef(null);

  const handleInput = (e) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    setMessageText(target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Сбрасываем в auto, чтобы определить новую минимальную высоту контента
      textareaRef.current.style.height = "auto";
      // Устанавливаем высоту по scrollHeight (даже если там пусто, будет min-height)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]); // Следим за состоянием текста

  const { data: current_participant, isLoading: loadingCurrentParticipant } =
    useQuery({
      queryKey: ["current_participant", roomId],
      queryFn: () =>
        api
          .get(`rooms/${roomId}/participants/me/`)
          .then((response) => response.data),
      onError: (err) => handleApiError(err),
    });

  const sendOCCMessageMutation = useMutation({
    mutationFn: (data) => api.post("chat/messages/?room=" + roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
      setMessageText("");
    },
    onError: (error) => {
      handleApiError(error);
    },
    retry: false,
  });

  const handleSendMessage = () => {
    const data = {
      text: messageText,
    };
    if (type === "GAME") {
      if (!current_participant.can_move) {
        toast.error("Вы не можете сделать ход!");
        return;
      }
      sendOCCMessageMutation.mutate({
        ...data,
        chat_type: "GAME",
      });
    }
    if (type === "OOC") {
      sendOCCMessageMutation.mutate({
        ...data,
        chat_type: "OOC",
      });
    }
  };

  if (loadingCurrentParticipant) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`message-input ${type.toLowerCase()}`}>
      <textarea
        ref={textareaRef}
        rows="1" // Начинаем с одной строки
        placeholder={
          type === "GAME" ? "Сделайте свой ход" : "Введите сообщение"
        }
        onChange={handleInput} // Используем нашу новую функцию
        value={messageText}
        disabled={type === "GAME" && !current_participant.can_move}
      />
      <button
        onClick={handleSendMessage}
        className={`${type === "GAME" && !current_participant.can_move ? "disabled" : ""}`}
        disabled={!messageText}
      >
        <b>^</b>
      </button>
    </div>
  );
};

export default MessageInput;
