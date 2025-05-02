// import axios from "axios";

// const API_URL = "http://localhost:8080/api/v1/auth";

// const authService = {
//   login: async (email, password) => {
//     try {
//       const response = await axios.post(`${API_URL}/login`, {
//         email,
//         password,
//       });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || "Login failed";
//     }
//   },

//   register: async (userData) => {
//     try {
//       const response = await axios.post(`${API_URL}/register`, userData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || "Registration failed";
//     }
//   },

//   logout: async () => {
//     try {
//       await axios.post(`${API_URL}/logout`);
//       localStorage.removeItem("token");
//       window.location.href = "/login"; // Chuyển hướng sau khi logout
//     } catch (error) {
//       console.error("Logout failed", error);
//     }
//   },
// };

// export default authService;

import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/auth";

// Tạo instance Axios có cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm để lấy token từ localStorage
const getToken = () => localStorage.getItem("token");

// Thêm interceptor để đính kèm token vào mỗi request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });

      // Lưu token vào localStorage nếu đăng nhập thành công
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || "Login failed";
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Registration failed";
    }
  },

  logout: async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("token");
      window.location.href = "/login"; // Chuyển hướng sau khi logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  verifyEmail: async (email) => {
    try {
      const response = await api.post("/verify-email", {
        recipientEmails: [email],
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to send verification email";
    }
  },
};

export default authService;
