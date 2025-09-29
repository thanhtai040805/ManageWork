import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./components/Register";
import { Login } from "./components/Login";
import { Home } from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
