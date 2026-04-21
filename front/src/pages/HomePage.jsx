import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import CreateRoomModal from "../features/rooms/CreateRoomModal";

import { handleApiError } from "../utils/errorHandler";

import roomSettingsIcon from "../assets/roomSettingsIcon.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isRoomAdmin = (room) => room.current_participant.is_room_admin;

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
                      navigate(`/rooms/${room.id}/participants/${room.current_participant.id}/create-character/`);
                    } else {
                      navigate(`/rooms/${room.id}/chat`);
                    } 
                    // else if (
                    //   room.current_participant.role === "DM" &&
                    //   !room.has_world &&
                    //   room.current_participant.is_room_admin
                    // ) {
                    //   navigate(`/rooms/${room.id}/create-world/`);
                    // } 
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
