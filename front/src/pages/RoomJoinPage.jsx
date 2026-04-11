import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import api from "../api/axios";

import { handleApiError } from "../utils/errorHandler";

const RoomJoinPage = () => {
  const [passcode, setPasscode] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const hasAttemptedAutoJoin = useRef(false);
  const [showForm, setShowForm] = useState(false);

  const { roomId } = useParams();

  const joinMutation = useMutation({
    mutationFn: (data) => api.post(`rooms/${roomId}/join/`, data),
    onSuccess: () => {
      toast.success("Вы успешно вошли в комнату!");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      navigate(`/`);
    },
    retry: false,
  });

  useEffect(() => {
    if (hasAttemptedAutoJoin.current) return;

    hasAttemptedAutoJoin.current = true;
    // Пытаемся войти без пароля
    // Автоматический вход на случай если комната не защищена паролем
    setTimeout(() => {
      joinMutation.mutate(
        {},
        {
          onError: (error) => {
            if (error.response?.status === 400) {
              setShowForm(true);
              toast.info(
                "Эта комната защищена паролем. Пожалуйста, введите его.",
              );
            } else {
              handleApiError(error);
            }
          },
        },
      );
    }, 100);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    joinMutation.mutate(
      { passcode },
      {
        onError: (error) => {
          handleApiError(error);
        },
      },
    );
  };

  if (!showForm) return null;
  return (
    <div className="room-join-container">
      <h1>Присоединиться к комнате</h1>
      <form className="room-join-form" onSubmit={handleSubmit}>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Введите пароль от комнаты"
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default RoomJoinPage;
