import { create } from "zustand";

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem("token"), // Проверяем токен при загрузке
  user: JSON.parse(localStorage.getItem("user")) || null,

  login: (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    set({
      user: userData,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ isAuthenticated: false });
  },
}));
