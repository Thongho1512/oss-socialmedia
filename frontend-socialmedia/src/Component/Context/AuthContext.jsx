import { createContext, useState, useEffect } from "react";

// Tạo Context
export const AuthContext = createContext();

// Provider cho AuthContext
export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Khi app chạy, lấy dữ liệu từ localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedToken = localStorage.getItem("access_token");

    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setAccessToken(storedToken);
    }
  }, []);

  // Hàm cập nhật Auth (khi đăng nhập)
  const setAuthData = (userId, token) => {
    setUserId(userId);
    setAccessToken(token);
    localStorage.setItem("access_token", Response.data.access_token);
    localStorage.setItem("user_id", Response.data.user.id);
  };

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("access_token");
    setUserId(null);
    setAccessToken(null);
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ userId, accessToken, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
