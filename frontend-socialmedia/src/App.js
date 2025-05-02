import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Component/Authentication/Login";
import VerifyEmail from "./Component/Authentication/VerifyEmail";
import RegisterInfo from "./Component/Authentication/RegisterInfo";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/register-info" element={<RegisterInfo />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
