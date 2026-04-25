import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router-dom";

import { useAuthStore } from "./features/auth/authStore";
import api from "./api/axios";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectRouter";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import RoomManagePage from "./pages/RoomManagePage";
import RoomJoinPage from "./pages/RoomJoinPage";
import GamePage from "./pages/GamePage";
import CreateCharacterPage from "./pages/CreateCharacterPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";

const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
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

          {/* Глобальная защита: только для залогиненных */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />

            <Route path="/rooms/:roomId/join" element={<RoomJoinPage />} />

            <Route
              path="/rooms/:roomId"
              element={<ProtectedRoute checkMembership={true} />}
            >
              <Route path="chat" element={<GamePage />} />
              <Route
                path="participants/:participantId/character"
                element={<CharacterDetailPage />}
              />
              <Route
                path="participants/:participantId/create-character"
                element={<CreateCharacterPage />}
              />

              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route index element={<RoomManagePage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer limit={3} position="bottom-right" theme="dark" />
    </>
  );
}

export default App;
