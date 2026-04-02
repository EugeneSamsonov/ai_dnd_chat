import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import CreateRoomModal from "../features/rooms/CreateRoomModal";

import { handleApiError } from "../utils/errorHandler";

import roomSettingsIcon from "../assets/roomSettingsIcon.png";

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const addNewRoom = (newRoom) => {
    setRooms((prevRooms) => {
      if (!Array.isArray(prevRooms)) {
        return [newRoom];
      }
      return [newRoom, ...prevRooms];
    });
  };

  const isRoomAdmin = (room) =>
    room.participants?.some(
      (p) => String(p.user) === String(currentUser?.id) && p.is_room_admin,
    );

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("rooms/");
        setRooms(response.data.results);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
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
        onRoomCreated={addNewRoom}
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
