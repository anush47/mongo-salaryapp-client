import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../Components/Header";
import CompaniesTable from "../Components/CompaniesTable";
import { Link } from "react-router-dom";

function Companies() {
  return (
    <div className="container">
      <div className="mt-3">
        <Header title="COMPANIES" />
        <Link to={"/"}>
          <button className="btn btn-outline-dark m-1">Back</button>
        </Link>
        <Link to={"/add-company"}>
          <button className="btn btn-success m-1">Add</button>
        </Link>
        <div className="mt-3">
          <CompaniesTable />
        </div>
      </div>
    </div>
  );
}

export default Companies;
