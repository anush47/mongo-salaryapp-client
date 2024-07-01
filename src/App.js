import { BrowserRouter, Routes, Route } from "react-router-dom";
import Companies from "./pages/Companies";
import EditCompany from "./pages/EditCompany";
import GenerateMonthly from "./pages/GenerateMonthly";
import AddCompany from "./pages/AddCompany";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AbhFillForm from "./pages/AbhFillForm";

function App() {
  //<BrowserRouter basename={process.env.PUBLIC_URL}>
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/abh/:employer_no/:epf_no" element={<AbhFillForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:employer_no" element={<EditCompany />} />
        <Route
          path="/companies/:employer_no/generate-monthly"
          element={<GenerateMonthly />}
        />
        <Route path="/add-company" element={<AddCompany />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
