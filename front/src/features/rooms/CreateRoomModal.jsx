import { useState } from "react";

import api from "../../api/axios";

import { handleApiError } from "../../utils/errorHandler";
import "./CreateRoomModal.css";

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [name, setName] = useState("");
  const [isAiDM, setisAiDM] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("rooms/", {
        name: name,
        isAiDM: isAiDM,
        passcode: passcode,
      });
      onRoomCreated(response.data);
      onClose();
        console.log(response.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        <h3>Создать приключение</h3>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название Комнаты"
            required
          />
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Пароль от комнаты (не обязательно)"
          />
          <label className="modal-checkbox">
            <input
              type="checkbox"
              value={isAiDM}
              onChange={(e) => setisAiDM(e.target.value)}
            />
            AI DM
          </label>
          <div className="modal-actions">
            <div
              className="modal-cancel-button"
              type="button"
              onClick={onClose}
            >
              x
            </div>
            <button className="modal-create-button" type="submit">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
