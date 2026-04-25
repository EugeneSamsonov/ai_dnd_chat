import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import api from "../api/axios";
import { useAuthStore } from "../features/auth/authStore";
import ManageParticipantCard from "../features/rooms/ManageParticipantCard";

import { handleApiError } from "../utils/errorHandler";

const RoomDetailPage = () => {
  const [newName, setNewName] = useState("");
  const [isNeedNewPassword, setIsNeedNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newIsAIDM, setNewIsAIDM] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { roomId } = useParams();
  const {
    data: room,
    isError,
    error,
    isPending,
  } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => api.get(`rooms/${roomId}/`).then((res) => res.data),
    staleTime: 15 * 1000 * 60,
    retry: false,
  });

  const updateRoomMutation = useMutation({
    mutationFn: (updatedData) => api.patch(`rooms/${roomId}/`, updatedData),

    onSuccess: (data) => {
      queryClient.invalidateQueries(["room", roomId], data);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });

      toast.success("Комната обновлена!");
    },
    onError: (e) => handleApiError(e),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`rooms/${roomId}/`),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["room", roomId] });
      queryClient.refetchQueries({ queryKey: ["rooms"] });
      toast.success("Комната удалена!");
      navigate("/");
    },
    onError: (e) => handleApiError(e),
  });

  const RoomFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {};

    if (newName !== room.name && newName) {
      payload.name = newName;
    } else payload.name = room.name;

    if (newIsAIDM !== room.is_ai_dm) payload.is_ai_dm = newIsAIDM;

    if (isNeedNewPassword) payload.passcode = newPassword;

    if (Object.keys(payload).length <= 1 && room.name === newName) {
      toast.error("Ничего не изменилось!");
      return;
    }

    updateRoomMutation.mutate(payload);
  };

  useEffect(() => {
    if (isError) {
      handleApiError(error);
    }

    if (!isPending && room) {
      setNewIsAIDM(room.is_ai_dm);
      setNewName(room.name);

      const isCreator = String(room.creator) === String(user?.id);
      const isAdmin = room.participants.some(
        (p) => String(p.user) === String(user?.id) && p.is_room_admin,
      );
      if (!isCreator && !isAdmin) {
        navigate("/");
      }
    }
  }, [room, isPending, isError, error, navigate, user?.id]);

  if (isPending) return <div>Загрузка данных комнаты...</div>;

  if (room === undefined) {
    return <div>Загрузка данных комнаты...</div>;
  }

  return (
    <div className="room-manager-container">
      <form className="room-manager-form" onSubmit={RoomFormSubmit}>
        <h2>Настройки комнаты</h2>

        <div className="room-settings">
          <input
            type="text"
            defaultValue={room.name}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Название"
          />
          <label className="room-manage-password-checkbox">
            Поменять пароль
            <input
              type="checkbox"
              name="isNeedNewPassword"
              onChange={(e) => setIsNeedNewPassword(e.target.checked)}
            />
          </label>
          {isNeedNewPassword && (
            <input
              type="text"
              placeholder="Новый пароль"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          )}
          <label>
            Возможности ИИ ДМ'а
            <input
              type="checkbox"
              name="isAIDM"
              onChange={(e) => setNewIsAIDM(e.target.checked)}
              defaultChecked={room.is_ai_dm}
            />
          </label>
          <div className="stats-row">
            <span>Ход: {room.turn_count}</span>
            <span>Статус: {room.turn_status}</span>
          </div>
        </div>

        <button
          type="submit"
          className="save-btn"
          disabled={updateRoomMutation.isPending}
        >
          Сохранить
        </button>
      </form>
      <div className="manage-participant-cards-list">
        <h2>Участники</h2>
        {room.participants
          .filter((p) => !p.is_banned)
          .map((participant) => {
            const isOwner = participant.user === room.creator;
            return (
              <ManageParticipantCard
                participant={participant}
                key={participant.id}
                isOwner={isOwner}
              />
            );
          })}
        {room.participants.filter((p) => p.is_banned).length > 0 && (
          <>
            <h2>Заблокированные участники</h2>
            {room.participants
              .filter((p) => p.is_banned)
              .map((participant) => {
                const isOwner = participant.user === room.creator;
                return (
                  <ManageParticipantCard
                    participant={participant}
                    key={participant.id}
                    isOwner={isOwner}
                  />
                );
              })}
          </>
        )}
      </div>

      <button
        type="button"
        className="delete-room-btn"
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      >
        Удалить комнату
      </button>
    </div>
  );
};

export default RoomDetailPage;
