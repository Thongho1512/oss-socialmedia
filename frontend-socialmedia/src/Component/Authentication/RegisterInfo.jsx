import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterInfo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");

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

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^0\d{9}$/;
    if (!phoneNumber) return true; // Empty is valid initially
    return phoneRegex.test(phoneNumber);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate phone number
    if (name === "phoneNumber") {
      if (value && !validatePhoneNumber(value)) {
        setPhoneError("Phone number must start with 0 and be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    }
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

      console.log("Registration successful:", response.data);
      alert("Registration successful! You can now log in.");
      navigate("/auth/login"); // Redirect to login page
    } catch (error) {
      console.error("Registration error:", error.response);
      alert("Registration failed! Please check your information.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">Get's Started</h1>
        <p className="text-sm text-center mb-4 text-gray-600">
          Already have an account? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => navigate("/auth/login")}>Sign in</span>
        </p>

        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            placeholder="Mitchel"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Johnson"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            placeholder="mitchel_johnson"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
            />
            <button 
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              type="button"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" />
                  <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@domain.com"
            value={formData.email}
            readOnly
            className="w-full px-3 py-2 border rounded bg-blue-100 text-black focus:outline-none"
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="0123456789"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 ${
              phoneError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
            } text-black`}
          />
          {phoneError && (
            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50 text-black font-medium"
          >
            <option value="MALE" className="text-black">Male</option>
            <option value="FEMALE" className="text-black">Female</option>
            <option value="OTHER" className="text-black">Other</option>
          </select>
        </div>

        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          className="hidden"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          disabled={phoneError}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default RegisterInfo;
