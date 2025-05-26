import { createContext, useState, useEffect } from "react";

// Create Context
export const AuthContext = createContext();

// Provider for AuthContext
export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  // When app runs, get data from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedToken = localStorage.getItem("access_token");

    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setAccessToken(storedToken);
    }
  }, []);  // Function to update Auth (when logging in)
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
