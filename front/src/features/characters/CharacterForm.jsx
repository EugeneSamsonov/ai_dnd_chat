import { useForm } from "react-hook-form";

import "./CharacterForm.css";

const CharacterForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      bio: "",
      hp: 100,
      level: 1,
      strength: 10,
      agility: 10,
      intelligence: 10,
    },
  });

  return (
    <form className="character-form" onSubmit={handleSubmit(onSubmit)}>
      <input
        placeholder="Имя персонажа"
        {...register("name")}
        className="character-name"
        required
      />
      <textarea
        placeholder="Краткая биография"
        {...register("bio")}
        className="character-bio"
        required
      />

      <div className="stats-grid">
        <label>
          Сила:{" "}
          <input
            type="number"
            {...register("strength")}
            className="character-strength"
            required
          />
        </label>
        <label>
          Ловкость:{" "}
          <input
            type="number"
            {...register("agility")}
            className="character-agility"
            required
          />
        </label>
        <label>
          Интеллект:{" "}
          <input
            type="number"
            {...register("intelligence")}
            className="character-intelligence"
            required
          />
        </label>
      </div>
      <textarea
        placeholder="Инвентарь"
        {...register("inventory")}
        className="character-inventory"
        required
      />

      <button type="submit" disabled={isLoading}>Создать персонажа</button>
    </form>
  );
};

export default CharacterForm;
