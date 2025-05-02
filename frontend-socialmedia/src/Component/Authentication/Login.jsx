import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        formData
      );
      console.log("Đăng nhập thành công:", response.data);
      alert("Đăng nhập thành công!");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đăng nhập thất bại!");
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
        />

        <button
          onClick={handleLogin}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-3"
        >
          Đăng nhập
        </button>

        <p className="text-center">Chưa có tài khoản?</p>

        <button
          onClick={() => navigate("/verify-email")}
          className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
