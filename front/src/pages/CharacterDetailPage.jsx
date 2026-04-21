import CharacterForm from "../features/characters/CharacterForm.jsx";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../api/axios";
import { handleApiError } from "../utils/errorHandler";
import "../features/characters/CreateCharacterPage.css";

const CreateCharacterPage = () => {
  const participantId = useParams().participantId;
  const roomId = useParams().roomId;

  const queryClient = useQueryClient();

  const { data: current_participant, isLoading: loadingCurrentParticipant } =
    useQuery({
      queryKey: ["current_participant", roomId],
      queryFn: () =>
        api
          .get(`rooms/${roomId}/participants/me/`)
          .then((response) => response.data),
      onError: (err) => handleApiError(err),
    });

  const { data: participant, isLoading: loadingParticipant } = useQuery({
    queryKey: ["participant", participantId],
    queryFn: () =>
      api
        .get(`rooms/${roomId}/participants/${participantId}/`)
        .then((response) => response.data),
    onError: (err) => handleApiError(err),
  });

  const updateCharacterMutation = useMutation({
    mutationFn: (data) => {
      return api.put(`game_core/characters/${participant.character.id}/`, {
        ...data,
        participant: participantId,
      });
    },
    onSuccess: () => {
      toast.success("Персонаж изменён!");
      queryClient.invalidateQueries(["room", roomId]);
    },
    onError: (err) => handleApiError(err),
  });

  if (loadingCurrentParticipant || loadingParticipant) {
    return <h1>Загрузка...</h1>;
  }

  return (
    <div className="create-character-page">
      <h1>
        {current_participant.is_room_admin ||
        current_participant.user === participant.user
          ? "Редактировать профиль персонажа"
          : "Профиль персонажа"}
      </h1>
      <CharacterForm
        isLoading={updateCharacterMutation.isPending}
        onSubmit={updateCharacterMutation.mutate}
        defaultValues={participant.character}
        isReadOnly={
          !current_participant.is_room_admin &&
          current_participant.user !== participant.user
        }
      />
    </div>
  );
};

export default CreateCharacterPage;
