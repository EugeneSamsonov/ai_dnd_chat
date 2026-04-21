import { useForm } from "react-hook-form";

import "./CharacterForm.css";
import { toast } from "react-toastify";

const CharacterForm = ({ onSubmit, isLoading, isReadOnly, defaultValues }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: defaultValues,
  });

  return (
    <form
      className="character-form"
      onSubmit={
        isReadOnly
          ? () => toast.error("Только для просмотра")
          : handleSubmit(onSubmit)
      }
    >
      <input
        placeholder="Имя персонажа"
        {...register("name")}
        className="character-name"
        disabled={isReadOnly}
        required
      />
      <textarea
        placeholder="Краткая биография"
        {...register("bio")}
        className="character-bio"
        disabled={isReadOnly}
        required
      />

      <div className="stats-grid">
        <label>
          Сила:{" "}
          <input
            type="number"
            {...register("strength")}
            className="character-strength"
            disabled={isReadOnly}
            required
          />
        </label>
        <label>
          Ловкость:{" "}
          <input
            type="number"
            {...register("agility")}
            className="character-agility"
            disabled={isReadOnly}
            required
          />
        </label>
        <label>
          Интеллект:{" "}
          <input
            type="number"
            {...register("intelligence")}
            className="character-intelligence"
            disabled={isReadOnly}
            required
          />
        </label>
      </div>
      <textarea
        placeholder="Инвентарь"
        {...register("inventory")}
        disabled={isReadOnly}
        className="character-inventory"
      />
      {!isReadOnly && (
        <button type="submit" disabled={isLoading}>
          Сохранить
        </button>
      )}
    </form>
  );
};

export default CharacterForm;
