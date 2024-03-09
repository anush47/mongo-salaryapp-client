import "bootstrap/dist/css/bootstrap.min.css";
import ".//styles.css";
import { Link, useParams } from "react-router-dom";
import CompanyEditTable from "../Components/CompanyEditTable";

function EditCompany() {
  const params = useParams();
  const employer_no = params.employer_no;

  return (
    <div className="container">
      <div className="mt-3">
        <CompanyEditTable employer_no={employer_no.replace("-", "/")} />
      </div>
    </div>
  );
}

export default EditCompany;
