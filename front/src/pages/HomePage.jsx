import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import CreateRoomModal from "../features/rooms/CreateRoomModal";

import { handleApiError } from "../utils/errorHandler";

import roomSettingsIcon from "../assets/roomSettingsIcon.png";
import { toast } from "react-toastify";

const HomePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isRoomAdmin = (room) => room.current_participant?.is_room_admin;

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () =>
      api
        .get("rooms/")
        .then((response) => response.data.results)
        .catch((e) => handleApiError(e)),
    refetchOnMount: true,
    staleTime: 0,
  });

  const copyRoomLinkToClipboard = (roomId) => {
    // const roomLink = `${window.location.origin}/rooms/${roomId}/join`;
    // navigator.clipboard.writeText(roomLink);
    // toast.success("Ссылка скопирована в буфер обмена!");

    const link = window.location.origin + `/rooms/${roomId}/join`;

    // 1. Проверяем, доступен ли современный API (HTTPS или localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(link)
        .then(() => toast.success("Ссылка скопирована в буфер обмена!"))
        .catch(() => toast.error("Не удалось скопировать"));
    } else {
      // 2. Старый "пуленепробиваемый" способ для http:// и IP-адресов
      const textArea = document.createElement("textarea");
      textArea.value = link;

      // Делаем элемент невидимым, чтобы интерфейс не прыгал
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      try {
        // Выполняем нативную команду копирования выделенного текста
        const successful = document.execCommand("copy");
        if (successful) {
          toast.success("Ссылка скопирована в буфер обмена!");
        } else {
          toast.error("Не удалось скопировать ссылку.");
        }
      } catch (err) {
        toast.error("Ошибка при копировании. Скопируйте вручную.");
      }

      // Удаляем временный элемент из DOM
      document.body.removeChild(textArea);
    }
  };

  if (isLoading) {
    return <h1>Загрузка...</h1>;
  }

  return (
    <div className="home-container">
      <button
        className="create-room-button"
        onClick={() => setIsModalOpen(true)}
      >
        Создать комнату
      </button>

      {/* Модалка */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {rooms.length > 0 ? (
        <>
          <h1 className="center">Ваши приключения</h1>
          <div className="room-list">
            {rooms.map((room) => (
              <div key={room.id} className="room-card-container">
                <div
                  key={room.id}
                  className="room-card-inner"
                  onClick={() => {
                    if (
                      room.current_participant.role === "PLAYER" &&
                      !room.current_participant.has_character
                    ) {
                      navigate(
                        `/rooms/${room.id}/participants/${room.current_participant.id}/create-character/`,
                      );
                    } else {
                      navigate(`/rooms/${room.id}/chat`);
                    }
                  }}
                >
                  <h3>{room.name}</h3>
                  <p>
                    Идёт{" "}
                    {room.turn_status === "DM_TURN"
                      ? "ход Мастера"
                      : "ход Игроков"}
                  </p>
                  <span>Ход №{room.turn_count}</span>
                  <div className="room-card-copy-link">
                    📋
                    <span onClick={() => copyRoomLinkToClipboard(room.id)}>
                      Скопировать приглашение
                    </span>
                  </div>
                </div>
                {isRoomAdmin(room) && (
                  <img
                    src={roomSettingsIcon}
                    alt="Настройки"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="room-settings-icon"
                  />
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p className="text-gray">
            Вы пока не участвуете ни в одной истории...
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
