import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";
import { useAuthStore } from "../features/auth/authStore";

import { handleApiError } from "../utils/errorHandler";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [re_password, setRePassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Отключаем перезагрузку страницы

    if (password !== re_password) {
      toast.error("Пароли не совпадают!");
      return;
    }
    if (password.length < 8) {
      toast.error("Пароль должен быть не менее 8 символов!");
      return;
    }

    try {
      await api.post("auth/users/", {
        username: username,
        email: email,
        password: password,
        re_password: re_password,
      });

      const response = await api.post("auth/token/login/", {
        username: username,
        password: password,
      });

      const token = response.data.auth_token;

      login(token);
      toast.success("Регистрация прошла успешна! Добро пожаловать!");
      navigate("/");
    } catch (e) {
      handleApiError(e);
    }
  };

  return (
    <div className="form-block">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          value={re_password}
          onChange={(e) => setRePassword(e.target.value)}
          required
        />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <Link to="/login">
        Уже есть аккаунт? <span>Войти</span>
      </Link>
    </div>
  );
};

export default RegisterPage;
