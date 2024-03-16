import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckBoxInput,
  DropdownInput,
  MinWidthSetTextArea,
  TableKey,
  TextInput,
} from "./InputComponents";

function EmployeesTable({ employees, handleChangeFunction, disabled }) {
  const [search, setSearch] = useState();
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeFields, setEmployeeFields] = useState([]);
  const [_employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({});

  const text_area_widths = {
    epf_no: "4rem",
    name: "10rem",
    nic: "9rem",
    divide_by: "5rem",
  };
  const default_total_variation = 1000; //default total salary variation
  const default_ot_hours_range = "55-85"; //default value for overtime hours range

  const emptyNewEmployee = (fields) => {
    const result_obj = fields.reduce((obj, key) => {
      switch (key) {
        case "_id":
          break;
        case "active":
          obj[key] = true;
          break;
        case "divide_by":
          obj[key] = 240;
          break;
        case "ot_hours_range":
          obj[key] = default_ot_hours_range;
          break;
        case "total_variation":
          obj[key] = default_total_variation;
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
    const fetchFields = async (schema) => {
      try {
        setEmployees(employees);
        const resFields = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/fields",
          {
            params: { schema: schema },
          }
        );
        setEmployeeFields(resFields.data);
        const emptyNew = emptyNewEmployee(resFields.data);
        setNewEmployee(emptyNew);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFields("employee");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (employees) {
      setEmployeesCountText();
    }
  }, [employees, _employees]);

  const setEmployeesCountText = () => {
    const activeEmployeesCount = employees.filter(
      (employee) => employee.active
    ).length;
    const totalEmployeesCount = employees.length;
    const employeesLabel = `Active Employees: ${activeEmployeesCount} out of ${totalEmployeesCount}`;

    document.getElementById("employees-label").innerText = employeesLabel;
  };

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
    if (!newEmployee["epf_no"]) {
      alert("EPF number cannot be blank");
      return false;
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
          const emptyNew = emptyNewEmployee(employeeFields);
          setNewEmployee(emptyNew);
        }
        break;
      default:
        if (e.target.id.startsWith("employee-del-btn-")) {
          const match = e.target.id.match(/^employee-del-btn-(.+)$/);
          const epf_no = match[1];
          // eslint-disable-next-line
          const index = employees.findIndex((item) => item["epf_no"] == epf_no);
          if (index !== -1) {
            const confirmEmployeeDelete = window.confirm(
              `${employees[index].epf_no} - ${employees[index].name} will be deleted. Are you sure ?`
            );
            if (confirmEmployeeDelete) {
              employees.splice(index, 1); // Remove 1 element starting from indexToRemove
              setEmployees([...employees]);
            }
          }
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
      if (disabled) {
        return null;
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
                  <td key={field + "new"}>
                    <div className="form-check form-switch">
                      <CheckBoxInput
                        key_name={"employee-" + field + "-new"}
                        value={true} // Value is true
                        handleChangeFunction={handleChange}
                        disabled={disabled}
                      />
                    </div>
                  </td>
                );
              case "divide_by":
                let options = [240, 200];
                return (
                  <td key={field + "new"} className="text-left">
                    <DropdownInput
                      keyName={"employee-" + field + "-new"}
                      value={options[0]}
                      optionKeys={options}
                      optionVals={options}
                      handleChangeFunction={handleChange}
                      disabled={disabled}
                      width={text_area_widths[field]}
                    />
                  </td>
                );
              case "ot_hours_range":
                return (
                  <td key={`${field}-new`} className="text-left">
                    <TextInput
                      key_name={`employee-${field}-new`}
                      value={default_ot_hours_range}
                      handleChangeFunction={handleChange}
                      disabled={disabled} // Pass disabled prop
                      width={text_area_widths[field]}
                    />
                  </td>
                );
              case "total_variation":
                return (
                  <td key={`${field}-new`} className="text-left">
                    <TextInput
                      key_name={`employee-${field}-new`}
                      value={default_total_variation}
                      handleChangeFunction={handleChange}
                      disabled={disabled} // Pass disabled prop
                      width={text_area_widths[field]}
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
                      width={text_area_widths[field]}
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
    } else {
      return (
        <tr>
          {employeeFields.map((field) => {
            switch (field) {
              case "_id":
              case "monthly_details":
                return null;
              case "active":
                return (
                  <td key={field + employee.epf_no} className="text-left">
                    <div className="form-check form-switch">
                      <CheckBoxInput
                        key_name={"employee-" + field + "-" + employee.epf_no}
                        value={employee.active}
                        handleChangeFunction={handleChangeFunction}
                        disabled={disabled}
                      />
                    </div>
                  </td>
                );
              case "divide_by":
                let options = [240, 200];
                return (
                  <td key={field + employee.epf_no} className="text-left">
                    <DropdownInput
                      keyName={"employee-" + field + "-" + employee.epf_no}
                      value={employee.divide_by}
                      optionKeys={options}
                      optionVals={options}
                      handleChangeFunction={handleChangeFunction}
                      disabled={disabled}
                      width={text_area_widths[field]}
                    />
                  </td>
                );

              default:
                return (
                  <td key={field + employee._id} className="text-left">
                    <TextInput
                      key_name={"employee-" + field + "-" + employee.epf_no}
                      value={employee[field] || ""} // Use empty string if value is falsy
                      handleChangeFunction={handleChangeFunction}
                      disabled={disabled}
                      width={text_area_widths[field]}
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
    }
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
        <table className="table table-responsive table-hover">
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
                        <MinWidthSetTextArea width={text_area_widths[field]} />
                      </th>
                    );
                }
              })}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                return (
                  <EmployeeRow key={employee.epf_no} employee={employee} />
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No employees found.
                </td>
              </tr>
            )}
            <EmployeeRow />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeesTable;
