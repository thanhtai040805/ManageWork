import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./components/Register";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/register" element={<SignUp />} />
          <Route path="/" element={<SignUp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
