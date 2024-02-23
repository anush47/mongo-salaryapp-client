import "bootstrap/dist/css/bootstrap.min.css";
import "./tablestyle.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckBoxInput, TableKey } from "./InputComponents";

function CompaniesTable() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState();
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async (val) => {
      try {
        const resCompanies = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/get-companies",
          { params: { search: val } }
        );
        setCompanies(resCompanies.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredCompanies((prevCompanies) =>
        prevCompanies.filter((company) =>
          company.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      // If search is empty, reset filteredCompanies to the original list
      setFilteredCompanies(companies);
    }
  }, [search, companies]);

  const handleChange = async (e) => {
    if (e.target.id === "search-input") {
      setSearch(e.target.value);
    }
  };

  return (
    <div>
      <input
        type="text"
        className="form-control mb-3"
        id="search-input"
        placeholder="Search..."
        onChange={handleChange}
      ></input>
      <div className="scrollable mt-2">
        <table className="table table-responsive table-hover">
          <thead>
            <tr>
              <th>
                <TableKey key_name={"Name"} />
              </th>
              <th>
                <TableKey key_name={"Employer No"} />
              </th>
              <th>
                <TableKey key_name={"Active"} />
              </th>
              <th>
                <TableKey key_name={"Employees"} />
              </th>
              <th>
                <TableKey key_name={"Edit"} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => {
              return (
                <tr key={company.employer_no}>
                  <td className="text-left">{company.name}</td>
                  <td className="text-left">{company.employer_no}</td>
                  <td className="text-left">
                    <CheckBoxInput value={company.active} readOnly={true} />
                  </td>
                  <td className="text-left">{company.employeeCount}</td>
                  <td>
                    <Link to={"./" + company.employer_no.replace("/", "-")}>
                      <button className="btn btn-outline-primary text-left">
                        EDIT
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompaniesTable;
