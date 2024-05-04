import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import ".//styles.css";
import Header from "../Components/Header";
import MonthlyEmployeeDetailsTable from "../Components/MonthlyEmployeeDetailsTable";
import { generate_monthly_details } from "../GenerationScripts/RandomGeneration";

import {
  CheckBoxInput,
  MonthInput,
  TableKey,
  TextInput,
} from "../Components/InputComponents";

function GenerateMonthly() {
  const currentDate = new Date();
  //previous month because index start from 0
  const currentMonth = ("0" + currentDate.getMonth()).slice(-2); // Ensure two digits for month
  const currentYear = currentDate.getFullYear();
  const currentYearMonth = currentYear + "-" + currentMonth;

  const params = useParams();
  const employer_no = params.employer_no.replace("-", "/");
  const [company, setCompany] = useState([]);
  const [newDetails, setNewDetails] = useState([]);
  const [disabled, setDisabled] = useState(true); // State variable for disabled
  const [currentMonthly, setCurrentMonthlyDetails] = useState({
    period: currentYearMonth,
  });
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [_employees, setEmployees] = useState([]);
  const [search, setSearch] = useState();
  const [includeAll, setIncludeAll] = useState(false);
  const [employeeMonthlyDetailFields, setEmployeeMonthlyDetailFields] =
    useState([]);

  const text_area_heights = {
    name: "1rem",
    employer_no: "1rem",
    default_epf_payment_method: "1rem",
    default_etf_payment_method: "1rem",
  };

  const emptyNewMonthly = (fields) => {
    const result_obj = fields.reduce((obj, key) => {
      switch (key) {
        case "_id":
        case "__v":
          break;
        default:
          obj[key] = null;
          break;
      }
      return obj;
    }, {});
    return result_obj;
  };

  useEffect(() => {
    const fetchCompany = async (employer_no) => {
      try {
        const resCompany = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/get-company",
          { params: { employer_no: employer_no } }
        );
        const companyData = resCompany.data;
        // Ensure employees, employees.monthly_details, and monthly_payments are defined
        if (!companyData.employees) {
          companyData.employees = [];
        }

        companyData.employees.forEach((employee) => {
          if (!employee.monthly_details) {
            employee.monthly_details = [];
          }
        });
        if (!companyData.monthly_payments) {
          companyData.monthly_payments = [];
        }

        setCompany(companyData);
        setNewDetails(Object.assign({}, companyData));

        companyData.employees.map((employee) => {
          const incentive_range =
            String(
              parseFloat(employee.incentive) -
                parseFloat(employee.incentive_variation) / 2
            ) +
            "-" +
            String(
              parseFloat(employee.incentive) +
                parseFloat(employee.incentive_variation) / 2
            );
          currentMonthly[employee.epf_no] = {
            total_salary_range: employee.total_salary_range
              ? employee.total_salary_range
              : 0,
            ot_hours_range: employee.ot_hours_range
              ? employee.ot_hours_range
              : 0,
            include: employee.active,
            incentive_range: incentive_range ? incentive_range : 0,
          };
        });
      } catch (error) {
        console.log(error);
      }
    };

    const fetchFields = async (schema) => {
      try {
        const resFields = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/fields",
          {
            params: { schema: schema },
          }
        );
        setEmployeeMonthlyDetailFields(resFields.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompany(employer_no);
    fetchFields("monthly-employee-details");
  }, [employer_no]);

  useEffect(() => {
    if (company.employees) {
      if (search) {
        setFilteredEmployees((prevEmployees) =>
          prevEmployees.filter((employee) =>
            employee.name.toLowerCase().includes(search.toLowerCase())
          )
        );
      } else {
        // If search is empty, reset filteredCompanies to the original list
        setFilteredEmployees(company.employees);
      }
    }
  }, [search, company]);

  const dataValidation = () => {
    if (!newDetails["name"]) {
      alert("Please enter a company name.");
      return false;
    } else {
      return true;
    }
  };

  const updateCompany = async () => {
    if (dataValidation()) {
      try {
        const updateCompanyResponse = await axios.post(
          "http://localhost:3001/update-company",
          newDetails
        );
        alert(updateCompanyResponse.data.message);
        console.log(updateCompanyResponse.data);
        window.location.reload(false);
        return true;
        //navigate("/companies");
      } catch (error) {
        // Error handling
        return false;
      } finally {
      }
    } else {
      return false;
    }
  };

  const handleChange = async (e) => {
    handleChangeElement(e.target);
  };

  const handleChangeElement = async (e) => {
    let value;

    switch (e.type) {
      case "checkbox":
        value = e.checked;
        break;
      //   case "select-one":
      //     value = e.value;
      //     break;
      default:
        value = e.value;
    }

    if (e.id === "search-input") {
      setSearch(value);
    } else if (e.id.startsWith("genmonthly")) {
      const match = e.id.match(/^genmonthly-(.+)-(.+)$/);
      if (match) {
        const epf_no = match[1];
        const field = match[2];
        if (epf_no != 0) {
          currentMonthly[epf_no][field] = value;
        } else {
          currentMonthly.period = value;
        }
      }
    } else if (e.id.startsWith("monthly")) {
      // Extract field_name and _id using regex
      const match = e.id.match(/^monthly-(.+)-(.+)-(.+)$/);
      if (match) {
        const field_name = match[1]; // Extracted field_name
        const epf_no = match[2]; // Extracted _id
        const monthly_id = match[3];

        const index_employee = newDetails.employees.findIndex(
          // eslint-disable-next-line
          (item) => item["epf_no"] == epf_no
        );

        const index_monthly = newDetails.employees[index_employee][
          "monthly_details"
        ].findIndex((item) => item["_id"] === monthly_id);

        newDetails.employees[index_employee]["monthly_details"][index_monthly][
          field_name
        ] = value;
        //console.log(field_name, value);
      }
    } else {
      newDetails[e.id] = value;
    }
  };

  const generateMonthlyPayments = () => {
    const monthlyDetails = generate_monthly_details(
      company,
      currentMonthly.period,
      currentMonthly
    );
    const employeesMap = new Map(
      company.employees.map((employee) => [String(employee.epf_no), employee])
    );

    for (const [key, value] of Object.entries(monthlyDetails)) {
      const employee = employeesMap.get(key);
      if (employee) {
        employee.monthly_details.push(value);
      }
    }

    setFilteredEmployees([...company.employees]);
    alert("Generation complete.");
  };

  const handleClick = async (e) => {
    switch (e.target.id) {
      case "save-btn":
        //console.log(newDetails);
        const updated = await updateCompany();
        if (updated) {
          setDisabled(true);
          e.target.id = "edit-btn";
          e.target.classList.remove("btn-success");
          e.target.classList.add("btn-primary");
          e.target.innerHTML = "Edit";
        } else {
          setDisabled(false);
        }
        break;
      case "edit-btn":
        setDisabled(false);
        e.target.id = "save-btn";
        e.target.classList.remove("btn-primary");
        e.target.classList.add("btn-success");
        e.target.innerHTML = "Save";
        break;
      case "genmonthly-generate-btn":
        setDisabled(false);
        const edit_e = document.getElementById("edit-btn");
        if (edit_e) {
          edit_e.click();
        }
        generateMonthlyPayments();
        break;

      case "change-include-btn":
        company.employees.forEach((employee) => {
          currentMonthly[employee.epf_no].include = includeAll;
          document.getElementById(
            "genmonthly-" + employee.epf_no + "-include"
          ).checked = includeAll;
        });
        setIncludeAll((prevState) => !prevState);
        break;
      default:
        // Default case for handling other button names or cases
        break;
    }
  };

  return (
    <div className="container mt-3">
      <Header title={(company ? company.name : null) + " - Monthly Details"} />
      <Link to={"/companies/" + params.employer_no}>
        <button className="btn btn-outline-dark m-1">Back</button>
      </Link>
      <button
        id="edit-btn"
        onClick={handleClick}
        className="btn btn-primary m-1"
      >
        Edit
      </button>
      <div className="scrollable mt-2">
        <div className="container">
          <input
            type="text"
            className="form-control mb-3"
            id="search-input"
            placeholder="Search Employees..."
            onChange={handleChange}
          ></input>
          <table className="table table-hover table-responsive">
            <thead>
              <tr>
                <th>
                  <TableKey key_name={"EPF no"} />
                </th>
                <th>
                  <TableKey key_name={"Name"} />
                </th>
                <th>
                  <TableKey key_name={"OT hours range"} />
                </th>
                <th>
                  <TableKey key_name={"Incentive Range"} />
                </th>
                <th>
                  <TableKey key_name={"Deductions"} />
                </th>
                <th>
                  <TableKey key_name={"Total Salary range"} />
                </th>
                <th style={{ display: "flex", alignItems: "center" }}>
                  <TableKey key_name={"Include"} />
                  <button
                    id="change-include-btn"
                    className="btn btn-outline-dark m-1 ms-2" // Adding margin to create space between the components
                    onClick={handleClick}
                    disabled={disabled}
                  >
                    Change
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees ? (
                filteredEmployees.map((employee) => {
                  return (
                    <tr key={employee.epf_no}>
                      <td>{employee.epf_no}</td>
                      <td>{employee.name}</td>
                      <td>
                        <TextInput
                          key_name={
                            "genmonthly-" + employee.epf_no + "-ot_hours_range"
                          }
                          value={employee.ot_hours_range}
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                          resizable={"block"}
                          height={"1rem"}
                        />
                      </td>
                      <td>
                        <TextInput
                          key_name={
                            "genmonthly-" + employee.epf_no + "-incentive_range"
                          }
                          handleChangeFunction={handleChange}
                          value={
                            employee.incentive
                              ? employee.incentive -
                                employee.incentive_variation / 2 +
                                "-" +
                                (employee.incentive +
                                  employee.incentive_variation / 2)
                              : 0
                          }
                          disabled={disabled} // Pass disabled prop
                          resizable={"block"}
                          height={"1rem"}
                        />
                      </td>
                      <td>
                        <TextInput
                          key_name={
                            "genmonthly-" + employee.epf_no + "-deductions"
                          }
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                          resizable={"block"}
                          height={"1rem"}
                        />
                      </td>
                      <td>
                        <TextInput
                          key_name={
                            "genmonthly-" +
                            employee.epf_no +
                            "-total_salary_range"
                          }
                          value={
                            //currentMonthly[employee.epf_no].total_salary_range
                            employee.total_salary
                              ? employee.total_salary -
                                employee.total_salary_variation / 2 +
                                "-" +
                                (employee.total_salary +
                                  employee.total_salary_variation / 2)
                              : 0
                          }
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                          resizable={"block"}
                          height={"1rem"}
                        />
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <CheckBoxInput
                            key_name={
                              "genmonthly-" + employee.epf_no + "-include"
                            }
                            value={employee.active}
                            handleChangeFunction={handleChange}
                            disabled={disabled}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3}>No employees found</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display: "flex", alignItems: "center" }}>
            <MonthInput
              key_name={"genmonthly-0-period"}
              value={currentYearMonth}
              handleChangeFunction={handleChange}
            />
            <button
              id="genmonthly-generate-btn"
              className="btn btn-outline-success mt-1 ms-1" // Adding margin to create space between the components
              onClick={handleClick}
            >
              Generate
            </button>
          </div>
        </div>
        <hr className="my-5" />
        <div className="container">
          <MonthlyEmployeeDetailsTable
            employees={newDetails.employees}
            handleChangeFunction={handleChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

export default GenerateMonthly;
