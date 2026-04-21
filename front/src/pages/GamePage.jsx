import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { handleApiError } from "../utils/errorHandler";
import { useAuthStore } from "../features/auth/authStore";
import ChatContainer from "../features/chat/ChatContainer";

import "../features/chat/GamePage.css";

const GamePage = () => {
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();

  const { roomId } = useParams();
  const { data: participants } = useQuery({
    queryKey: ["participants", roomId],
    queryFn: () =>
      api
        .get(`rooms/${roomId}/participants/?withCharacters=true`)
        .then((res) => res.data.results),
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
    onError: (err) => handleApiError(err),
  });

  return (
    <div className="game-page-layout">
      <aside className="sidebar">
        <h3>Игроки</h3>
        {participants
          ?.sort((a, b) => {
            if (a.user === user.id) return -1;
            if (b.user === user.id) return 1;

            
            if (a.role !== "SPECTATOR" && b.role === "SPECTATOR") return -1;
            if (a.role === "SPECTATOR" && b.role !== "SPECTATOR") return 1;
            
            if (a.role === "DM" && b.role !== "DM") return -1;
            if (b.role === "DM" && a.role !== "DM") return 1;

            const aIsAlive = a.character?.hp > 0;
            const bIsAlive = b.character?.hp > 0;

            if (aIsAlive !== bIsAlive) {
              return aIsAlive ? -1 : 1;
            }

            // 3. (Опционально) Сортировка по имени среди равных по статусу
            return a.nickname.localeCompare(b.nickname);
          })
          .map((participant) => (
            <div
              className={
                "participant-character-card " +
                participant.role.toLowerCase() +
                " " +
                (participant.is_room_admin ? "admin" : "") +
                " " +
                (participant.user === user.id ? "self" : "") +
                " " +
                (participant.character?.hp <= 0 ? "dead" : "")
              }
              key={participant.id}
              onClick={() => {
                if (participant.character !== null && participant.role === "PLAYER") {
                    navigate(`/rooms/${roomId}/participants/${participant.id}/character/`)
                }
              }}
            >
              <p className="participant-info">
                {participant.role === "DM" && (
                  <span className="game-owner-tag">Мастер игрок</span>
                )}
                {participant.role === "SPECTATOR" && (
                  <span className="game-spectator-tag">Наблюдатель</span>
                )}
                <strong>{participant.nickname}</strong>
                {participant.is_room_admin && (
                  <span className="game-admin-tag">Админ</span>
                )}
              </p>
              {participant.character !== null && participant.role === "PLAYER" && (
                <>
                  <p className="char-info">
                    {participant.character.name} • {participant.character.level}{" "}
                    Lv •{" "}
                    {participant.character.hp <= 0
                      ? " DEAD"
                      : participant.character.hp + " HP"}
                  </p>
                  <div className="character-stats-row">
                    <span>Сила {participant.character.strength}</span>
                    <span>Ловкость {participant.character.agility}</span>
                    <span>Интеллект {participant.character.intelligence}</span>
                  </div>
                  <p className="inv-preview">
                    Инвентарь: {participant.character.inventory}
                  </p>
                </>
              )}
            </div>
          ))}
      </aside>

      <section className="chat-section">
        <ChatContainer />
      </section>
    </div>
  );
};

export default GamePage;
