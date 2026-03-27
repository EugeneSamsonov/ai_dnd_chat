import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../features/auth/authStore";

import { toast } from 'react-toastify';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Отключаем перезагрузку страницы

    try {
      const response = await api.post("auth/token/login/", {
        username: username,
        password: password,
      });

      const token = response.data.auth_token;

      login(token);
      toast.success("Добро пожаловать!");
      navigate("/");
    } catch (e) {
      const errors = e.response?.data;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key].join(", ")}`);
        });
      } else {
        toast.error("Что-то пошло не так на сервере");
      }
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
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
      <Link to="/register">
        Нет аккаунта? <span>Регистрация</span>
      </Link>
    </div>
  );
};

export default LoginPage;
