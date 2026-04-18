import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import api from "../../api/axios";
import { handleApiError } from "../../utils/errorHandler";
import { useAuthStore } from "../auth/authStore";

const ManageParticipantCard = ({ participant, isOwner }) => {
  const roles = {
    Игрок: "PLAYER",
    ДМ: "DM",
    Наблюдатель: "SPECTATOR",
  };
  const roleNames = {
    PLAYER: "Игрок",
    DM: "ДМ",
    SPECTATOR: "Наблюдатель",
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { roomId } = useParams();

  const kickMutation = useMutation({
    mutationFn: (participantId) =>
      api.delete(`rooms/${roomId}/participants/${participantId}/`),
    onSuccess: () => {
      queryClient.refetchQueries(["room", roomId]);
      toast.success("Игрок исключен");
      // Если админ сам себя исключил то отправляем его на главную
      if (participant.user === user.id) {
        navigate("/");
      }
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  const updateParticipantMutation = useMutation({
    mutationFn: ({ participantId, payload }) =>
      api.patch(`rooms/${roomId}/participants/${participantId}/`, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["room", roomId] }),
        queryClient.invalidateQueries({ queryKey: ["rooms"] }),
      ]);
      toast.success("Игрок обновлен");
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  return (
    <div className="participant-card">
      <div className="participant-header">
        <span className="nickname">{participant.nickname}</span>
        {isOwner ? (
          <span className="owner-tag">Владелец</span>
        ) : (
          <button
            type="button"
            className="kick-button"
            onClick={() => kickMutation.mutate(participant.id)}
          >
            Kick
          </button>
        )}
      </div>

      <div className="participant-controls">
        <select
          defaultValue={roleNames[participant.role]}
          onChange={(e) =>
            updateParticipantMutation.mutate({
              participantId: participant.id,
              payload: { role: roles[e.target.value] },
            })
          }
        >
          {Object.keys(roles).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        {!isOwner && (
          <label className="admin-checkbox">
            <input
              type="checkbox"
              defaultChecked={participant.is_room_admin}
              onChange={(e) =>
                updateParticipantMutation.mutate({
                  participantId: participant.id,
                  payload: { is_room_admin: e.target.checked },
                })
              }
            />
            Admin
          </label>
        )}
      </div>
    </div>
  );
};

export default ManageParticipantCard;
