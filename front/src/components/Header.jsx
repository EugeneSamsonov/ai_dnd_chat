import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuthStore } from "../features/auth/authStore";
import api from "../api/axios";

import { handleApiError } from "../utils/errorHandler";

import logoutIcon from "../assets/logout.png";
import dndIcon from "../assets/dndIcon.png";

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("auth/token/logout/"); // Стучимся к Djoser
      toast.success("Вы успешно вышли!");
    } catch (e) {
      handleApiError(e);
    } finally {
      // На случай если токен стал невалиден
      logout(); // Чистим стор и localStorage
      navigate("/login");
    }
  };

  if (!isAuthenticated) return null; // Если не вошел, хедер можно скрыть

  return (
    <header>
      <nav>
        <div className="header-elements">
          <Link to="/">
            <img className="dnd-logo-icon" src={dndIcon} alt="" />
          </Link>
          {/* <Link to="/rooms">Комнаты</Link> */}
        </div>

        <div>
          <h2 className="header-title">DnD AI Chat</h2>
        </div>

        <div className="header-elements">
          <span>Привет, {user?.username || "Игрок"}</span>
          <button className="logout-button" onClick={handleLogout}>
            <img src={logoutIcon} alt="Разлогиниться" />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
