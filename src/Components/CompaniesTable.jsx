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

  const handleClick = async (e) => {
    if (e.target.id.startsWith("delete-company-btn-")) {
      const idArray = e.target.id.split("-");
      // Get the employer number from the id
      const employerNo = idArray[3];

      // Find the company with matching employer number
      const companyToDelete = companies.find(
        (company) => company.employer_no == employerNo
      );

      if (companyToDelete) {
        // Confirm deletion with user
        const confirmDelete = window.confirm(
          `Are you sure you want to delete ${companyToDelete.name}?`
        );

        // If user confirms deletion, proceed with deletion
        if (confirmDelete) {
          try {
            // Call the deleteCompany function with the employer number
            await deleteCompany(employerNo);
          } catch (error) {
            alert(`An error occurred while deleting the company: \n${error}`);
          }
        }
      } else {
        alert("Company not found.");
      }
    }
  };

  const deleteCompany = async (employer_no) => {
    try {
      const resDel = await axios.post(
        process.env.REACT_APP_SERVER_URL + "/delete-company",
        { params: { employer_no: employer_no } }
      );
      console.log(resDel.data, employer_no);
      setCompanies(companies.filter((c) => c.employer_no !== employer_no));
    } catch (err) {
      alert(`An error occurred while deleting the company: \n${err}`);
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
                <TableKey key_name={"Active Employees"} />
              </th>
              <th>
                <TableKey key_name={"Manage"} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies ? (
              filteredCompanies.map((company) => {
                return (
                  <tr key={company.employer_no}>
                    <td className="text-left">{company.name}</td>
                    <td className="text-left">{company.employer_no}</td>
                    <td className="text-left">
                      <div className="form-check form-switch">
                        <CheckBoxInput
                          key_name={company.employer_no + "_active"}
                          value={company.active}
                          readOnly={true}
                        />
                      </div>
                    </td>
                    <td className="text-left">
                      {company.activeEmployeesCount}
                    </td>
                    <td>
                      <Link to={"./" + company.employer_no.replace("/", "-")}>
                        <button className="btn btn-outline-primary text-left m-1">
                          View
                        </button>
                      </Link>
                      <button
                        className="btn btn-outline-danger text-left m-1"
                        id={"delete-company-btn-" + company.employer_no}
                        onClick={handleClick}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompaniesTable;
