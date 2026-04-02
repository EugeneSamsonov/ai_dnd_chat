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
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isRoomAdmin = (room) =>
    room.participants?.some(
      (p) => String(p.user) === String(currentUser?.id) && p.is_room_admin,
    );

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () =>
      api
        .get("rooms/")
        .then((response) => response.data.results)
        .catch((e) => handleApiError(e)),
    staleTime: 60 * 60 * 1000, // Данные считаются свежими 60 минут.

    refetchOnWindowFocus: false, // НЕ делать запрос при каждом возвращении во вкладку
    refetchOnMount: false, // НЕ делать запрос, если данные уже есть в кэше
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
        // onRoomCreated={addNewRoom}
      />

      {rooms.length > 0 ? (
        <>
          <h1 className="center">Ваши приключения</h1>
          <div className="room-list">
            {rooms.map((room) => (
              <div className="room-card-container">
                <div
                  key={room.id}
                  className="room-card-inner"
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  <h3>{room.name}</h3>
                  <p>
                    Идёт{" "}
                    {room.status === "DM_TURN" ? "ход Мастера" : "ход Игроков"}
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
