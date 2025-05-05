import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterInfo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    username: "",
    dob: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "MALE",
    status: "NONE",
    roles: ["USER"],
  });

  useEffect(() => {
    let emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      emailFromUrl = emailFromUrl.replace(/[\[\]]/g, "");
      setFormData((prevData) => ({ ...prevData, email: emailFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/register",
        {
          lastName: formData.lastName,
          firstName: formData.firstName,
          username: formData.username,
          dob: formData.dob,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          status: "ACTIVE",
          roles: ["USER"],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Đăng ký thành công:", response.data);
      alert("Đăng ký thành công! Bạn có thể đăng nhập.");
      navigate("/auth/login"); // Chuyển hướng sang trang đăng nhập
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response);
      alert("Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Nhập Thông Tin Đăng Ký</h1>

      <input
        type="text"
        name="firstName"
        placeholder="Họ"
        value={formData.firstName}
        onChange={handleChange}
        className="px-4 py-2 border rounded-lg mb-2"
      />

      <input
        type="text"
        name="lastName"
        placeholder="Tên"
        value={formData.lastName}
        onChange={handleChange}
        className="px-4 py-2 border rounded-lg mb-2"
      />

      <input
        type="text"
        name="username"
        placeholder="Tên đăng nhập"
        value={formData.username}
        onChange={handleChange}
        className="px-4 py-2 border rounded-lg mb-2"
      />

      <input
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleChange}
        className="px-4 py-2 border rounded-lg mb-2"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        readOnly
        className="px-4 py-2 border rounded-lg mb-2 bg-gray-200"
      />

      <input
        type="password"
        name="password"
        placeholder="Mật khẩu"
        value={formData.password}
        onChange={handleChange}
        className="px-4 py-2 border rounded-lg mb-2"
      />

      <input
        type="text"
        name="phoneNumber"
        placeholder="Số điện thoại"
        value={formData.phoneNumber}
        onChange={handleChange}
        className="px-4 py-2 border rounded-lg mb-2"
      />

      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="px-4 py-2 border rounded-lg mb-2"
      >
        <option value="MALE">Nam</option>
        <option value="FEMALE">Nữ</option>
      </select>

      <button
        onClick={handleRegister}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Đăng Ký
      </button>
    </div>
  );
};

export default RegisterInfo;
