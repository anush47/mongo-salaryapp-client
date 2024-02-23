import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useParams } from "react-router-dom";
import EmployeesTable from "../Components/EmployeesTable";

function Employees() {
  const params = useParams();
  const employer_no = params.employer_no;

  return (
    <div className="container">
      <div className="mt-3">
        <div className="mt-3">
          <EmployeesTable
            employer_no={employer_no ? employer_no.replace("-", "/") : ""}
          />
        </div>
      </div>
    </div>
  );
}

export default Employees;
