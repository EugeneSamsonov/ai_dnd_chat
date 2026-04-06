import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import api from "../../api/axios";
import { handleApiError } from "../../utils/errorHandler";

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
  const { roomId } = useParams();

  const kickMutation = useMutation({
    mutationFn: (participantId) =>
      api.delete(`rooms/${roomId}/participants/${participantId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["room", roomId]);
      toast.success("Игрок исключен");
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  const updateParticipantMutation = useMutation({
    mutationFn: ({ participantId, payload }) =>
      api.patch(`rooms/${roomId}/participants/${participantId}/`, payload),
    onSuccess: () => {
      // queryClient.invalidateQueries(["room", roomId]);
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
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
        <button
          type="button"
          className="kick-button"
          onClick={() => kickMutation.mutate(participant.id)}
        >
          Kick
        </button>
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

        {!isOwner && <label className="admin-checkbox">
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
        </label>}
      </div>
    </div>
  );
};

export default ManageParticipantCard;
