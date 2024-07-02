import Header from "../Components/Header";
import CompaniesTable from "../Components/CompaniesTable";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Companies() {
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
        <Header title="COMPANIES" />
        <Link to={"/"}>
          <button className="btn btn-outline-dark m-1 shadow">Back</button>
        </Link>
        <Link to={"/add-company"}>
          <button className="btn btn-success m-1 shadow">Add</button>
        </Link>
        <div className="mt-3">
          <CompaniesTable />
        </div>
      </div>
    </div>
  );
}

export default Companies;
