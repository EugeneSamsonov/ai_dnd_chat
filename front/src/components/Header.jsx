import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import api from "../api/axios";

const Header = () => {
  const { isAuthenticated, logout, username } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("auth/token/logout/"); // Стучимся к Djoser
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      logout(); // Чистим стор и localStorage
      navigate("/login");
    }
  };

  if (!isAuthenticated) return null; // Если не вошел, хедер можно скрыть

  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "10px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Link to="/">Главная</Link>
      <Link to="/rooms">Комнаты</Link>
      <div>
        <span>
          Привет, <b>{username || "Игрок"}</b>
        </span>
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </nav>
  );
};

export default Header;
