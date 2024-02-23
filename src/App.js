import { BrowserRouter, Routes, Route } from "react-router-dom";
import Companies from "./pages/Companies";
import EditCompany from "./pages/EditCompany";
import AddCompany from "./pages/AddCompany";
import Employees from "./pages/Employees";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/companies" element={<Companies />}></Route>
        <Route path="/companies/:employer_no" element={<EditCompany />}></Route>
        <Route
          path="/companies/:employer_no/employees"
          element={<Employees />}
        ></Route>
        <Route path="/add-company" element={<AddCompany />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
