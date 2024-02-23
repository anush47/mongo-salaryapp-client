import "bootstrap/dist/css/bootstrap.min.css";
import "./tablestyle.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckBoxInput, TableKey, TextInput } from "./InputComponents";

function EmployeesTable({ employees, handleChangeFunction, disabled }) {
  const [search, setSearch] = useState();
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeFields, setEmployeeFields] = useState([]);
  const [_employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({});

  useEffect(() => {
    const fetchFields = async (schema) => {
      try {
        setEmployees(employees);
        const resFields = await axios.get("http://localhost:3001/fields", {
          params: { schema: schema },
        });
        setEmployeeFields(resFields.data);
        const result_obj = resFields.data.reduce((obj, key) => {
          switch (key) {
            case "_id":
              break;
            case "active":
              obj[key] = true;
              break;

            default:
              obj[key] = null;
              break;
          }
          return obj;
        }, {});
        setNewEmployee(result_obj);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFields("employee");
  }, [employees]);

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
  }, [search, employees, _employees]);

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
          setEmployees(...employees);
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
          console.log(epf_no);
          console.log(employees);
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

    if (e.target.id === "search-input") {
      setSearch(value);
    }
    if (e.target.id.startsWith("employee") && e.target.id.endsWith("new")) {
      // Extract field_name and _id using regex
      const match = e.target.id.match(/^employee-(.+)-(.+)$/);
      if (match) {
        const field_name = match[1]; // Extracted field_name
        newEmployee[field_name] = value;
      }
    }
  };

  const EmployeeRow = ({ employee }) => {
    // Check if employee is not provided
    if (!employee) {
      return (
        <tr>
          {employeeFields.map((field) => {
            switch (field) {
              case "_id":
              case "monthly_details":
                return null;
              case "active":
                return (
                  <td key={field + "new"}>
                    <CheckBoxInput
                      key_name={"employee-" + field + "-new"}
                      value={true} // Value is true
                      handleChangeFunction={handleChange}
                      disabled={disabled}
                    />
                  </td>
                );

              default:
                return (
                  <td key={field + "new"}>
                    <TextInput
                      key_name={"employee-" + field + "-new"}
                      value="" // Empty value for other fields
                      handleChangeFunction={handleChange}
                      disabled={disabled}
                    />
                  </td>
                );
            }
          })}
          <td className="text-center">
            <button
              id="add-btn"
              onClick={handleClick}
              className="btn btn-outline-success me-2"
              disabled={disabled}
            >
              Add
            </button>
          </td>
        </tr>
      );
    }

    return (
      <tr>
        {employeeFields.map((field) => {
          switch (field) {
            case "_id":
            case "monthly_details":
              return null;
            case "active":
              return (
                <td key={field + employee._id} className="text-left">
                  <CheckBoxInput
                    key_name={"employee-" + field + "-" + employee._id}
                    value={employee.active}
                    handleChangeFunction={handleChangeFunction}
                    disabled={disabled}
                  />
                </td>
              );

            default:
              return (
                <td key={field + employee._id} className="text-left">
                  <TextInput
                    key_name={"employee-" + field + "-" + employee._id}
                    value={employee[field] || ""} // Use empty string if value is falsy
                    handleChangeFunction={handleChangeFunction}
                    disabled={disabled}
                  />
                </td>
              );
          }
        })}
        <td className="txt-center">
          <button
            className="btn btn-outline-danger"
            id={"employee-del-btn-" + employee.epf_no}
            onClick={handleClick}
            disabled={disabled}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <input
        type="text"
        className="form-control mb-3"
        id="search-input"
        placeholder="Search Employees..."
        onChange={handleChange}
      ></input>
      <div className="scrollable mt-2">
        <table className="table table-hover">
          <thead>
            <tr>
              {employeeFields.map((field) => {
                switch (field) {
                  case "_id":
                  case "monthly_details":
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
              return <EmployeeRow key={employee.epf_no} employee={employee} />;
            })}
            <EmployeeRow />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeesTable;
