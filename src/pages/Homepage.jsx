import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import Header from "../Components/Header";

const Homepage = () => {
  return (
    <div>
      <div className="container">
        <div className="mt-3">
          <Header title={"Salary App"} />
          <Link to="/companies">
            <button className="btn btn-primary m-2">Companies</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
