import "bootstrap/dist/css/bootstrap.min.css";
import "./tablestyle.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckBoxInput,
  MonthInput,
  TableKey,
  TextInput,
} from "./InputComponents";

function MonthlyPaymentDetailsTable({
  employees,
  handleChangeFunction,
  disabled,
}) {
  const [search, setSearch] = useState();
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeMonthlyDetailFields, setEmployeeMonthlyDetailFields] =
    useState([]);
  const [period, setPeriod] = useState();
  const [_employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({});

  useEffect(() => {
    const fetchFields = async (schema) => {
      try {
        setEmployees(employees);
        const resFields = await axios.get("http://localhost:3001/fields", {
          params: { schema: schema },
        });
        setEmployeeMonthlyDetailFields(resFields.data);
        const result_obj = resFields.data.reduce((obj, key) => {
          switch (key) {
            case "_id":
              break;
            // case "active":
            //   obj[key] = true;
            //   break;

            default:
              obj[key] = null;
              break;
          }
          return obj;
        }, {});
        setPeriod(); //initial period
        setNewEmployee(result_obj);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFields("monthly-employee-details");
  });

  useEffect(() => {
    if (employees) {
      if (search) {
        setFilteredEmployees((prevEmployees) =>
          prevEmployees.filter((employee) =>
            employee.name.toLowerCase().includes(search.toLowerCase())
          )
        );
      } else {
        // If search is empty, reset filteredCompanies to the original list
        setFilteredEmployees(employees);
      }
    }
  }, [search, employees]);

  useEffect(() => {
    if (period && filteredEmployees) {
      const [year, month] = period.split("-");

      const _filteredEmployees = employees.map((employee) => {
        const filteredMonthlyDetails =
          employee.monthly_details?.filter((monthlyDetail) => {
            const [monthlyYear, monthlyMonth] = monthlyDetail.period.split("-");

            return monthlyYear === year && monthlyMonth === month;
          }) ?? []; // If monthly_details is undefined, set to empty array

        return {
          ...employee,
          monthly_details: filteredMonthlyDetails,
        };
      });
      setFilteredEmployees(_filteredEmployees);
    } else if (employees) {
      setFilteredEmployees(employees);
    }
  }, [period, employees, filteredEmployees]);

  const newDataValidation = () => {
    for (let key in newEmployee) {
      switch (key) {
        case "gross_salary":
        case "total_salary":
          break;

        default:
          if (newEmployee[key] === "") {
            alert(`${key} cannot be blank.`);
            console.log(key);
            return false;
          }
          break;
      }
    }
    return true;
  };

  const handleClick = async (e) => {
    switch (e.target.id) {
      case "add-btn":
        console.log(newEmployee);
        if (newDataValidation()) {
          employees.push(newEmployee);
          setEmployees([...employees]);
        }
        console.log(_employees);
        break;
      default:
        if (e.target.id.startsWith("employee-del-btn-")) {
          const match = e.target.id.match(/^employee-del-btn-(.+)$/);
          const epf_no = match[1];
          const index = employees.findIndex(
            (item) => item["epf_no"] === epf_no
          );
          if (index !== -1) {
            employees.splice(index, 1); // Remove 1 element starting from indexToRemove
            setEmployees([...employees]);
          }
          alert(index);
        }
    }
  };

  const handleChange = async (e) => {
    let value;

    switch (e.target.type) {
      case "checkbox":
        value = e.target.checked;
        break;
      //   case "select-one":
      //     value = e.value;
      //     break;
      default:
        value = e.target.value;
    }

    if (e.target.id === "search-input-monthly") {
      setSearch(value);
    }
    if (e.target.id === "period-selection") {
      setPeriod(value);
    }
    if (e.target.id.startsWith("monthly") && e.target.id.endsWith("new")) {
      // Extract field_name and _id using regex
      const match = e.target.id.match(/^monthly-(.+)-(.+)$/);
      if (match) {
        const field_name = match[1]; // Extracted field_name
        newEmployee[field_name] = value;
      }
    }
  };

  const MonthlyDetailRows = ({ employee }) => {
    // Check if employee is not provided add Employee
    if (!employee) {
      return (
        <tr>
          <td colSpan="5">New Payment</td>
        </tr>
      );
    } else {
      return (
        <>
          {employee.monthly_details.map((monthlyDetail, index) => (
            <tr key={index}>
              <td>{employee.epf_no}</td>
              <td>{employee.name}</td>
              {employeeMonthlyDetailFields.map((field) => {
                switch (field) {
                  case "_id":
                    return null; // Skip rendering _id field
                  case "period":
                    return (
                      <td
                        key={`${field}-${employee._id}-${monthlyDetail._id}`}
                        className="text-left"
                      >
                        <MonthInput
                          key_name={`monthly-${field}-${employee._id}-${monthlyDetail._id}`}
                          value={monthlyDetail ? monthlyDetail[field] : ""}
                          handleChangeFunction={handleChangeFunction}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    );
                  case "active":
                    return (
                      <td
                        key={`${field}-${employee._id}-${monthlyDetail._id}`}
                        className="text-left"
                      >
                        <CheckBoxInput
                          key_name={`monthly-${field}-${employee._id}-${monthlyDetail._id}`}
                          value={employee.active}
                          handleChangeFunction={handleChangeFunction}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    );
                  default:
                    return (
                      <td
                        key={`${field}-${employee._id}-${monthlyDetail._id}`}
                        className="text-left"
                      >
                        <TextInput
                          key_name={`monthly-${field}-${employee._id}-${monthlyDetail._id}`}
                          value={monthlyDetail ? monthlyDetail[field] : ""}
                          handleChangeFunction={handleChangeFunction}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    );
                }
              })}
              <td className="txt-center">
                <button
                  className="btn btn-outline-danger"
                  id={`monthly-del-btn-${employee.epf_no}-${monthlyDetail._id}`}
                  onClick={handleClick}
                  disabled={disabled}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </>
      );
    }
  };

  return (
    <div>
      <div className="mb-3 d-flex align-items-center">
        <p className="h6 me-2">Period :</p>{" "}
        <MonthInput
          key_name={"period-selection"}
          handleChangeFunction={handleChange}
          value={""}
          disabled={disabled} // Pass disabled prop
        />
      </div>
      <input
        type="text"
        className="form-control mb-3"
        id="search-input-monthly"
        placeholder="Search Employee..."
        onChange={handleChange}
        disabled={disabled} // Pass disabled prop
      />
      <div className="scrollable mt-2">
        <table className="table table-responsive table-hover">
          <thead>
            <tr>
              <th>
                <TableKey key_name={"EPF NO"} />
              </th>
              <th>
                <TableKey key_name={"NAME"} />
              </th>
              {employeeMonthlyDetailFields.map((field) => {
                switch (field) {
                  case "_id":
                  case "__v":
                    return null;

                  default:
                    return (
                      <th key={field}>
                        <TableKey
                          key_name={field.toUpperCase().replace("_", " ")}
                        />
                      </th>
                    );
                }
              })}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => {
              return (
                <MonthlyDetailRows key={employee.epf_no} employee={employee} />
              );
            })}
            <MonthlyDetailRows />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyPaymentDetailsTable;
