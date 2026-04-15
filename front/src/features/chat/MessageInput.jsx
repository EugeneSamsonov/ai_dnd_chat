import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import api from "../../api/axios";
import { handleApiError } from "../../utils/errorHandler";

import "./MessageInput.css";

const MessageInput = ({ type }) => {
  const [messageText, setMessageText] = useState("");

  const queryClient = useQueryClient();

  const roomId = useParams().roomId;
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
    if (type === "GAME") {
      // TODO: отправить сообщение в игру
    }
    if (type === "OOC") {
      sendOCCMessageMutation.mutate({
        text: messageText,
        chat_type: "OOC",
      });
    }
  };

  return (
    <div className={`message-input ${type.toLowerCase()}`}>
      <input
        type="text"
        placeholder={`Enter ${type} message`}
        onChange={(e) => {
          setMessageText(e.target.value);
        }}
        value={messageText}
      />
      <button onClick={handleSendMessage}><b>^</b></button>
    </div>
  );
};

export default MessageInput;
