import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user starts typing again
    if (name === "email") {
      setEmailError("");
    } else if (name === "password") {
      setPasswordError("");
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value.trim() !== "" && !validateEmail(value)) {
      setEmailError("Whoops! This email is invalid!");
    }
  };

  const handleLogin = async () => {
    // Validate email before submission
    if (!validateEmail(formData.email)) {
      setEmailError("Whoops! This email is invalid!");
      return;
    }
    
    // Check if password is empty
    if (!formData.password) {
      setPasswordError("Password is required");
      return;
    }
    
    try {
      // Convert the email-based login to username if needed by your backend
      const loginPayload = {
        username: formData.email, // Your backend might expect username instead of email
        password: formData.password
      };

      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        loginPayload
      );

      // Lưu access token vào localStorage
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user.id);

      console.log("Đăng nhập thành công:", response.data);
      // Chuyển hướng đến homepage
      navigate("/homepage", { replace: true });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.response);
      // Display specific error for incorrect password
      setPasswordError("Incorrect password for this email");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-80">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-black">Get's started.</h2>
          <p className="text-sm text-gray-600 mt-1">
            Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/auth/verify-email")}>Sign up</span>
          </p>
          <p className="text-xs text-gray-400 mt-4">or login with email</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 ${emailError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} text-black`}
            />
            {emailError && (
              <div className="mt-1 text-xs text-red-500 flex items-center">
                <span className="font-medium mr-1">⚠️ Whoops!</span> This email is invalid!
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 pr-10 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 ${passwordError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} text-black`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility}
                size="small"
                sx={{ 
                  position: 'absolute', 
                  right: '8px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  padding: '4px',
                  color: '#9ca3af' // light gray color
                }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </div>
            {passwordError && (
              <div className="mt-1 text-xs text-red-500">
                {passwordError}
              </div>
            )}
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
