import { useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";

const TestAuth = () => {
  const { userId, accessToken, setAuthData, logout } = useContext(AuthContext);

  useEffect(() => {
    console.log("User ID:", userId);
    console.log("Access Token:", accessToken);
  }, [userId, accessToken]);

  return (
    <div>
      <h2>Test Auth Context</h2>
      <p>User ID: {userId}</p>
      <p>Access Token: {accessToken}</p>
      <button onClick={() => setAuthData("test_user", "test_token")}>
        Set Auth Data
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default TestAuth;
