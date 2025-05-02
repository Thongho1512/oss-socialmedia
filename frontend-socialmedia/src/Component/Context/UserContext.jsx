import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// Tạo instance Axios với cấu hình cơ bản
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");

    if (!userId || !accessToken) {
      console.warn("User ID hoặc Token không tồn tại!");
      setError("User ID hoặc Token không tồn tại!");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data && response.data.Status === 200) {
          setUserData(response.data.Data1);
          setUserPosts(response.data.Data2);
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API User:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserById = useCallback(async (userId) => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("access_token");

      const response = await api.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        setUserData(response.data.Data1);
        setUserPosts(response.data.Data2);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API User:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        userPosts,
        loading,
        error,
        fetchUserById,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
