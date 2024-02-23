import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../Components/Header";
import { Link } from "react-router-dom";
import AddCompanyTable from "../Components/AddCompanyTable";

function AddCompany() {
  return (
    <div className="container">
      <div className="mt-3">
        <Header title="ADD COMPANY" />
        <div className="mt-3">
          <AddCompanyTable />
        </div>
      </div>
    </div>
  );
}

export default AddCompany;
