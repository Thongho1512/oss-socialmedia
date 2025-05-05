import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  
  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    
    if (token && userId) {
      // Đã đăng nhập, không tự động chuyển hướng
      console.log("Người dùng đã đăng nhập.");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        formData
      );

      // Lưu access token vào localStorage
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user.id);

      console.log("Đăng nhập thành công:", response.data);
      // Chuyển hướng đến homepage
      navigate("/homepage", { replace: true });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.response);
      alert("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Đăng nhập</h2>

        <input
          type="text"
          name="username"
          placeholder="Tên đăng nhập"
          value={formData.username}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-4"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
        />

        <button
          onClick={handleLogin}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-3"
        >
          Đăng nhập
        </button>

        <p className="text-center">Chưa có tài khoản?</p>

        <button
          onClick={() => navigate("/auth/verify-email")}
          className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
