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
// & 'C:\Program Files\Java\jdk-21\bin\java.exe' '@C:\Users\thang\AppData\Local\Temp\cp_djs4h0y3gvbyrxff0uxaqqye3.argfile' 'com.oss.socialmedia.SocialmediaApplication' 