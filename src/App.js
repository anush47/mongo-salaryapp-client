import { BrowserRouter, Routes, Route } from "react-router-dom";
import Companies from "./pages/Companies";
import EditCompany from "./pages/EditCompany";
import AddCompany from "./pages/AddCompany";
import Employees from "./pages/Employees";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
