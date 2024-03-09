import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../Components/Header";
import {
  TextInput,
  CheckBoxInput,
  TableKeyWithResetBtn,
  DateInput,
  PaymentMethodInput,
} from "../Components/InputComponents";
import "./tablestyle.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeesTable from "./EmployeesTable";
import MonthlyEmployeeDetailsTable from "./MonthlyEmployeeDetailsTable";
import MonthlyPaymentsTable from "./MonthlyPaymentDetailsTable";

function CompanyEditTable({ employer_no }) {
  const [company, setCompany] = useState([]);
  const [newDetails, setNewDetails] = useState([]);
  const [disabled, setDisabled] = useState(true); // State variable for disabled

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
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompany(employer_no);
  }, [employer_no]);

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
    if (e.id.startsWith("employee")) {
      // Extract field_name and _id using regex
      const match = e.id.match(/^employee-(.+)-(.+)$/);
      if (match) {
        const field_name = match[1]; // Extracted field_name
        const epf_no = match[2]; // Extracted _id
        const index = newDetails.employees.findIndex(
          // eslint-disable-next-line
          (item) => item["epf_no"] == epf_no
        );
        newDetails.employees[index][field_name] = value;
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
        console.log(field_name, value);
      }
    } else if (e.id.startsWith("payment")) {
      // Extract field_name and _id using regex
      const match = e.id.match(/^payment-(.+)-(.+)$/);
      if (match) {
        const field_name = match[1]; // Extracted field_name
        const _id = match[2]; // Extracted _id
        const index = newDetails.monthly_payments.findIndex(
          (item) => item["_id"] === _id
        );
        newDetails.monthly_payments[index][field_name] = value;
      }
    } else {
      newDetails[e.id] = value;
    }
    const reset_btn = document.getElementById(e.id + "-reset");
    if (reset_btn) {
      reset_btn.className = "btn btn-outline-danger ms-3 text-end";
    }
    //console.log(value);
  };

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
      case "company-btn":
        document
          .getElementById("company-section")
          .scrollIntoView({ behavior: "smooth" });
        break;
      case "employees-btn":
        document
          .getElementById("employees-section")
          .scrollIntoView({ behavior: "smooth" });
        break;
      case "monthly-employee-details-btn":
        document
          .getElementById("monthly-employee-details-section")
          .scrollIntoView({ behavior: "smooth" });
        break;
      case "monthly-payment-details-btn":
        document
          .getElementById("monthly-payment-details-section")
          .scrollIntoView({ behavior: "smooth" });
        break;
      // Add more cases as needed
      default:
        // Default case for handling other button names or cases
        break;
    }
  };

  const reset = (key_name) => {
    newDetails[key_name] = company[key_name];
    document.getElementById(`${key_name}-reset`).className = "d-none";
    const e = document.getElementById(key_name);
    switch (e.type) {
      case "checkbox":
        e.checked = company[key_name];
        break;
      case "date":
        e.value = company[key_name] ? company[key_name].split("T")[0] : "";
        break;
      default:
        e.value = company[key_name];
        break;
    }
  };

  return (
    <div>
      <Header title={company ? company.name : "Company Details"} />
      <div className="text-start">
        <Link to={"/companies"}>
          <button className="btn btn-outline-dark me-2">Back</button>
        </Link>
        <button
          id="company-btn"
          onClick={handleClick}
          className="btn btn-outline-dark me-2"
        >
          Company
        </button>
        <button
          id="employees-btn"
          onClick={handleClick}
          className="btn btn-outline-dark me-2"
        >
          Employees
        </button>
        <button
          id="monthly-employee-details-btn"
          onClick={handleClick}
          className="btn btn-outline-dark me-2"
        >
          Monthly Employee Details
        </button>
        <button
          id="monthly-payment-details-btn"
          onClick={handleClick}
          className="btn btn-outline-dark me-2"
        >
          Monthly Payment Details
        </button>
        <button
          id="edit-btn"
          onClick={handleClick}
          className="btn btn-primary me-2"
        >
          Edit
        </button>
      </div>
      <div className="scrollable mt-2">
        <div id="company-section" className="h3 mb-3">
          <b>Company Details</b>
        </div>
        <table className="table table-hover table-responsive">
          <tbody>
            {Object.entries(newDetails).map(([key, value]) => {
              switch (key) {
                case "_id":
                case "__v":
                case "employees":
                case "monthly_payments":
                  return null;
                case "default_epf_payment_method":
                case "default_etf_payment_method":
                  return (
                    <tr key={key}>
                      <td>
                        <TableKeyWithResetBtn
                          key_name={key}
                          resetFuction={reset}
                        />
                      </td>
                      <td>
                        <PaymentMethodInput
                          key_name={key}
                          value={value}
                          handleChangeFunction={handleChange}
                          handleChangeElementFunction={handleChangeElement}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    </tr>
                  );
                case "active":
                case "epf_required":
                case "etf_required":
                case "salary_sheets_required":
                case "pay_slips_required":
                  //bools
                  return (
                    <tr key={key}>
                      <td>
                        <TableKeyWithResetBtn
                          key_name={key}
                          resetFuction={reset}
                        />
                      </td>
                      <td>
                        <CheckBoxInput
                          key_name={key}
                          value={value}
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    </tr>
                  );
                case "start_day":
                case "start_day_by_me":
                  //days
                  return (
                    <tr key={key}>
                      <td>
                        <TableKeyWithResetBtn
                          key_name={key}
                          resetFuction={reset}
                        />
                      </td>
                      <td>
                        <DateInput
                          key_name={key}
                          value={value}
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    </tr>
                  );
                default:
                  return (
                    <tr key={key}>
                      <td>
                        <TableKeyWithResetBtn
                          key_name={key}
                          resetFuction={reset}
                        />
                      </td>
                      <td>
                        <TextInput
                          key_name={key}
                          value={value}
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    </tr>
                  );
              }
            })}
          </tbody>
        </table>
        <hr className="my-5" />
        <div id="employees-section" className="h3 mb-3">
          <b id="employees-label">Employees</b>
        </div>
        <EmployeesTable
          employees={newDetails.employees}
          handleChangeFunction={handleChange}
          disabled={disabled}
        />
        <hr className="my-5" />
        <div id="monthly-employee-details-section" className="h3 mb-3">
          <b>Monthly Employee Details</b>
        </div>
        <MonthlyEmployeeDetailsTable
          employees={newDetails.employees}
          handleChangeFunction={handleChange}
          disabled={disabled}
        />
        <hr className="my-5" />
        <div id="monthly-payment-details-section" className="h3 mb-3">
          <b>Monthly Payment Details</b>
        </div>
        <MonthlyPaymentsTable
          company={newDetails}
          monthly_payments={newDetails.monthly_payments}
          handleChangeFunction={handleChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default CompanyEditTable;
