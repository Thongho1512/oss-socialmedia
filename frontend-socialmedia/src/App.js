import { Route, Routes } from "react-router-dom";
import HomePage from "./Component/HomePage/HomePage";
import Users from "./Component/Users/Users";
import "./App.css";
import Authentication from "./Component/Authentication/Authentication";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/*" element={true ? <HomePage /> : <Authentication />} />
      </Routes>
    </div>
  );
}
export default App;
