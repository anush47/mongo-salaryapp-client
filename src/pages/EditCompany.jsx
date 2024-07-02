import "bootstrap/dist/css/bootstrap.min.css";
import ".//styles.css";
import { Link, useParams } from "react-router-dom";
import CompanyEditTable from "../Components/CompanyEditTable";
import { useState, useEffect } from "react";

function EditCompany() {
  const params = useParams();
  const employer_no = params.employer_no;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading completion after initial render
    setIsLoading(false);
  }, []);

  return (
    <div className="container">
      <div
        className={`mt-3 fade ${isLoading ? "fade-out" : "fade-in"}`}
        style={{
          transition: "opacity 0.25s ease-in-out",
          opacity: isLoading ? 0 : 1,
        }}
      >
        <div className="mt-3">
          <CompanyEditTable employer_no={employer_no.replace("-", "/")} />
        </div>
      </div>
    </div>
  );
}

export default EditCompany;
