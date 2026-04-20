import CharacterForm from "../features/characters/CharacterForm.jsx";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import api from "../api/axios";
import { handleApiError } from "../utils/errorHandler";
import "../features/characters/CreateCharacterPage.css";

const CreateCharacterPage = () => {
  const participantId = useParams().participantId;
  const roomId = useParams().roomId;

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createCharacterMutation = useMutation({
    mutationFn: (data) => {
      return api.post("game_core/characters/", {
        ...data,
        participant: participantId,
      });
    },
    onSuccess: () => {
      toast.success("Персонаж создан!");
      queryClient.invalidateQueries(["room", roomId]);
      navigate(`/rooms/${roomId}/chat/`);
    },
    onError: (err) => handleApiError(err),
  });


  return (
    <div className="create-character-page">
      <h1>Создание персонажа</h1>
      <CharacterForm isLoading={createCharacterMutation.isPanding} onSubmit={createCharacterMutation.mutate}/>
    </div>
  );
};

export default CreateCharacterPage;
