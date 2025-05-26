import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError("Whoops! This email is invalid!");
    } else {
      setEmailError("");
    }
  };

  const handleSendVerifyEmail = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError("Whoops! This email is invalid!");
      return;
    }

    try {      await axios.post("http://localhost:8080/api/v1/email/send", {
        recipientEmails: [email], // Send email
      });

      alert("Verification email has been sent! Check your inbox.");    } catch (error) {
      alert(error?.message || "Failed to send verification email!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-medium text-center mb-4 text-black">Get's started.</h1>
        <p className="text-sm text-center mb-6 text-gray-600">
          Already have an account? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => navigate("/auth/login")}>Sign in</span>
        </p>
        
        <p className="text-xs text-center text-gray-400 mb-6">or login with email</p>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 text-black ${
              emailError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {emailError && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {emailError}
            </p>
          )}
        </div>
        
        {/* <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
         
        </div> */}
        
        <button
          onClick={handleSendVerifyEmail}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
