import { BrowserRouter, Routes, Route } from "react-router-dom";
import Companies from "./pages/Companies";
import EditCompany from "./pages/EditCompany";
import GenerateMonthly from "./pages/GenerateMonthly";
import AddCompany from "./pages/AddCompany";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  //<BrowserRouter basename={process.env.PUBLIC_URL}>
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/companies" element={<Companies />}></Route>
        <Route path="/companies/:employer_no" element={<EditCompany />}></Route>
        <Route
          path="/companies/:employer_no/generate-monthly"
          element={<GenerateMonthly />}
        ></Route>
        <Route path="/add-company" element={<AddCompany />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
