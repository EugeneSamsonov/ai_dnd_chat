import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import api from "../../api/axios";

import { handleApiError } from "../../utils/errorHandler";
import "./AskAIModal.css";

const AskAIModal = ({ isOpen, onClose, data }) => {
  const { register, handleSubmit, setValue } = useForm();
  const { roomId } = useParams();

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  const askAiMutation = useMutation({
    mutationKey: ["ask-ai", roomId], // Общий ключ, чтобы кэш его помнил
    mutationFn: (data) =>
      {
        toast.success("Запрос к ИИ отправлен! Это может занять некоторое время...");
        return api.post("chat/messages/ask-ai/?room=" + roomId, data).then((response) => response.data)
      },
    onSuccess: (data) => {
      toast.success("Ответ от ИИ получен!");
      setValue("promt", data.suggestion);
    },
    onError: (error) => {
      handleApiError(error);
    },
    retry: false,
    // Включаем кэширование самой мутации в памяти приложения
    gcTime: 5 * 60 * 1000, 
  });
  
  const onSubmit = (data) => {
    askAiMutation.mutate(data);
  };

  useEffect(() => {
    setValue("promt", data?.suggestion);
  }, [data, setValue]);

  return (
    <div
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        <h3>Напишите промт к ИИ</h3>
        <form
          className="modal-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <textarea
            type="text"
            className="ask-ai-modal-textarea"
            placeholder="Введите ваш промт..."
            {...register("promt")}
            required
          />

          <label className="modal-checkbox">
            Передать контекст игры
            <input
              type="checkbox"
              {...register("withContext")}
            />
          </label>

          <div className="modal-actions">
            <div
              className="modal-cancel-button"
              type="button"
              onClick={onClose}
            >
              x
            </div>
            <button
              className="modal-create-button"
              type="submit"
              disabled={askAiMutation.isPending}
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskAIModal;
