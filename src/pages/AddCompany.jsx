import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../Components/Header";
import { Link } from "react-router-dom";
import AddCompanyTable from "../Components/AddCompanyTable";
import { useState, useEffect } from "react";

function AddCompany() {
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
          <Header title="ADD COMPANY" />
          <div className="mt-3">
            <AddCompanyTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCompany;
