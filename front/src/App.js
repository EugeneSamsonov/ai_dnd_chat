import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import { useAuthStore } from "./features/auth/authStore";
import api from "./api/axios";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import RoomManagePage from "./pages/RoomManagePage";
import RoomJoinPage from "./pages/RoomJoinPage";
import GamePage from "./pages/GamePage";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated, login, logout } = useAuthStore();

  const { isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("auth/users/me/").then((res) => res.data),
    enabled: isAuthenticated,
    onSuccess: (userData) => {
      const token = localStorage.getItem("token");
      login(token, userData);
    },
    onError: () => {
      logout();
    },
    retry: false,
    // staleTime: 5 * 60 * 1000, // Данные считаются свежими 5 минут.
    staleTime: Infinity, // Данные считаются свежими всегда

    refetchOnWindowFocus: false, // НЕ делать запрос при каждом возвращении во вкладку
    refetchOnMount: false, // НЕ делать запрос, если данные уже есть в кэше
    refetchOnReconnect: false,
  });

  if (isLoading && isAuthenticated) {
    return <div>Проверка связи с сервером...</div>;
  }

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/rooms/:roomId"
            element={
              <PrivateRoute>
                <RoomManagePage />
              </PrivateRoute>
            }
          />

          {/* Защищенные роуты */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/rooms/:roomId/join"
            element={
              <PrivateRoute>
                <RoomJoinPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rooms/:roomId/chat"
            element={
              <PrivateRoute>
                <GamePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer limit={3} position="bottom-right" theme="dark" />
    </>
  );
}

export default App;
