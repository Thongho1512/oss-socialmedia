import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Component/Authentication/Login";
import VerifyEmail from "./Component/Authentication/VerifyEmail";
import RegisterInfo from "./Component/Authentication/RegisterInfo";
import HomePage from "./Component/HomePage/HomePage";
import { AuthProvider } from "./Component/Context/AuthContext";
import { UserProvider } from "./Component/Context/UserContext";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/register-info" element={<RegisterInfo />} />
          <Route path="/homepage/*" element={<HomePage />} />
        </Routes>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;