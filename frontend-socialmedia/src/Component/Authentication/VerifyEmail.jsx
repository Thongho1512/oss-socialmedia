import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendVerifyEmail = async () => {
    try {
      await axios.post("http://localhost:8080/api/v1/email/send", {
        recipientEmails: [email], // Gửi email
      });

      alert("Email xác minh đã được gửi! Kiểm tra hộp thư của bạn.");
    } catch (error) {
      alert(error?.message || "Gửi email xác minh thất bại!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Xác Minh Email</h1>
      <input
        type="email"
        placeholder="Nhập email của bạn"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 border rounded-lg mb-2"
      />
      <button
        onClick={handleSendVerifyEmail}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Gửi Email Xác Minh
      </button>
      <button
        onClick={() => navigate("/login")}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Đăng Nhập
      </button>
    </div>
  );
};

export default VerifyEmail;
