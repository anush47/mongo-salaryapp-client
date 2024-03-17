import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import ".//styles.css";
import Header from "../Components/Header";
import MonthlyEmployeeDetailsTable from "../Components/MonthlyEmployeeDetailsTable";
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
  const [currentMonthlyDetails, setCurrentMonthlyDetails] = useState({
    period: currentYearMonth,
  });
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [_employees, setEmployees] = useState([]);
  const [search, setSearch] = useState();
  const [newMonthly, setNewMonthly] = useState({});
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
          const totalSalary = parseFloat(employee.total_salary);
          const totalVariation = isNaN(parseFloat(employee.total_variation))
            ? 0
            : parseFloat(employee.total_variation);

          currentMonthlyDetails[employee.epf_no] = {
            total_range: `${totalSalary - totalVariation / 2}-${
              totalSalary + totalVariation / 2
            }`,
            ot_hours_range: employee.ot_hours_range
              ? employee.ot_hours_range
              : 0,
            include: employee.active,
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
          currentMonthlyDetails[epf_no][field] = value;
        } else {
          currentMonthlyDetails.period = value;
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
    console.log(e.id + ":" + value);
    console.log(currentMonthlyDetails);
  };

  const generateMonthlyPayments = () => {
    const get_random_ot_hours = (range) => {
      let ot_hours = 0;

      // Check if range is a string and not empty
      if (typeof range === "string" && range.trim() !== "") {
        const [min, max] = range.split("-").map((val) => parseInt(val.trim())); // Split and parse values to integers

        // If only one number is given, it is the value
        if (!isNaN(min) && isNaN(max)) {
          ot_hours = min;
        }
        // If both min and max are valid numbers
        else if (!isNaN(min) && !isNaN(max)) {
          ot_hours = Math.floor(Math.random() * (max - min + 1)) + min;
        }
      }

      return ot_hours;
    };

    const get_random_total_salary = (range) => {
      let total_salary = 0;
      // Check if range is a string and not empty
      if (typeof range === "string" && range.trim() !== "") {
        const [min, max] = range
          .split("-")
          .map((val) => parseFloat(val.trim())); // Split and parse values to integers

        // If only one number is given, it is the value
        if (!isNaN(min) && isNaN(max)) {
          total_salary = min;
        }
        // If both min and max are valid numbers
        else if (!isNaN(min) && !isNaN(max)) {
          total_salary = Math.random() * (max - min) + min;
        }
      }
      return total_salary;
    };

    const get_random_incentive = (incentive, variation) => {
      // Parse strings to numbers
      const parsedIncentive = parseFloat(incentive);
      const parsedVariation = parseFloat(variation);

      if (
        !isNaN(parsedIncentive) &&
        !isNaN(parsedVariation) &&
        parsedVariation !== 0
      ) {
        const halfVariation = Math.abs(parsedVariation) / 2;
        const min = Math.max(parsedIncentive - halfVariation, 0);
        const max = parsedIncentive + halfVariation;
        return Math.random() * (max - min) + min;
      } else {
        return parsedIncentive;
      }
    };

    const get_random_incentive_allowance = (gross_salary, ot, total_salary) => {
      const ratio_difference_max = 0.4; // 0.4 means incentive can be from 0.3 to 0.7 of incentive + allowances

      // Calculate the maximum and minimum values for incentive based on the ratio difference
      const max_incentive_ratio = 0.5 + ratio_difference_max / 2;
      const min_incentive_ratio = 0.5 - ratio_difference_max / 2;

      const available_range = total_salary - (gross_salary + ot);

      // Calculate the range of incentive
      const max_incentive = available_range * max_incentive_ratio;
      const min_incentive = available_range * min_incentive_ratio;

      // Calculate the range of incentive
      const incentive_range = max_incentive - min_incentive;

      // Generate a random value within the range
      const incentive = min_incentive + Math.random() * incentive_range;

      // Calculate the corresponding allowances based on the incentive
      const allowances = total_salary - (gross_salary + ot + incentive);

      return [incentive, allowances];
    };

    // Example usage:
    const [incentive, allowances] = get_random_incentive_allowance(
      3000,
      200,
      5000
    );
    console.log("Incentive:", incentive);
    console.log("Allowances:", allowances);

    company.employees.forEach((employee) => {
      if (currentMonthlyDetails[employee.epf_no].include) {
        if (!employee.gross_salary) {
          alert(
            `employee ${employee.epf_no} - ${employee.name} does not have gross salary`
          );
          return;
        }

        const emptyNew = emptyNewMonthly(employeeMonthlyDetailFields);

        const gross_salary = parseFloat(employee.gross_salary);

        const ot_hours = get_random_ot_hours(
          currentMonthlyDetails[employee.epf_no].ot_hours_range
        );
        const ot = (ot_hours * 1.5 * gross_salary) / employee.divide_by;

        const total_salary = get_random_total_salary(
          currentMonthlyDetails[employee.epf_no].total_range
        );
        const deductions = parseFloat(
          currentMonthlyDetails[employee.epf_no].deductions || 0
        );

        let [incentive, allowances] = [0, 0];
        if (employee.incentive) {
          incentive = get_random_incentive(
            employee.incentive,
            employee.incentive_variation
          );
          allowances = parseFloat(
            total_salary - (gross_salary + incentive + ot)
          );
        } else {
          [incentive, allowances] = get_random_incentive_allowance(
            gross_salary,
            ot,
            total_salary
          );
        }
        const month_salary = parseFloat(total_salary - deductions);

        //set values of monthlydetails
        const to_currency = (value, remove_0) => {
          if (remove_0 && value !== undefined && value == 0) {
            return "";
          }
          return value !== undefined ? value.toFixed(2) : "N/A";
        };

        emptyNew.period = currentMonthlyDetails.period;

        emptyNew.gross_salary = to_currency(gross_salary);
        emptyNew.ot_y =
          ot_hours !== undefined ? ot_hours + " - OT Hours" : "N/A";
        emptyNew.ot = to_currency(ot);
        emptyNew.incentive = to_currency(incentive);
        emptyNew.allowances = to_currency(allowances);
        emptyNew.deductions = to_currency(deductions, true);
        emptyNew.month_salary = to_currency(month_salary);

        employee.monthly_details.push(emptyNew);
        console.log(emptyNew);
        setNewMonthly(emptyNewMonthly(employeeMonthlyDetailFields));
        setFilteredEmployees([...company.employees]);
      }
    });
    alert("Generation complete.");

    //setNewMonthly(emptyNew);
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
          currentMonthlyDetails[employee.epf_no].include = includeAll;
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
                  <TableKey key_name={"EPF No"} />
                </th>
                <th>
                  <TableKey key_name={"Employee Name"} />
                </th>
                <th>
                  <TableKey key_name={"OT-hours range"} />
                </th>
                <th>
                  <TableKey key_name={"Deductions"} />
                </th>
                <th>
                  <TableKey key_name={"Total range"} />
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
                            "genmonthly-" + employee.epf_no + "-total_range"
                          }
                          value={
                            currentMonthlyDetails[employee.epf_no].total_range
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
              className="btn btn-outline-primary mt-1 ms-1" // Adding margin to create space between the components
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
