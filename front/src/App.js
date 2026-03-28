// src/App.js
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { useAuthStore } from "./features/auth/authStore";
import api from "./api/axios";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      api
        .get("auth/users/me/")
        .then((response) => {
          useAuthStore.getState().login(token, response.data);
        })
        .catch((e) => {
          console.log("Ошибка проверки сессии:", e);

          if (e.response.status === 401) {
            useAuthStore.getState().logout();
          }
        });
    }
  });

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищенные роуты */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}

export default App;
