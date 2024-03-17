import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DropdownInput,
  MinWidthSetTextArea,
  MonthInput,
  TableKey,
  TextInput,
} from "./InputComponents";

function MonthlyEmployeeDetailsTable({
  employees,
  handleChangeFunction,
  disabled,
}) {
  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeMonthlyDetailFields, setEmployeeMonthlyDetailFields] =
    useState([]);
  const [period, setPeriod] = useState("");
  const [newMonthly, setNewMonthly] = useState({});
  const [visibleColumns, setVisibleColumns] = useState([]);

  const currentDate = new Date();
  //previous month because index start from 0
  const currentMonth = ("0" + currentDate.getMonth()).slice(-2); // Ensure two digits for month
  const currentYear = currentDate.getFullYear();
  const currentYearMonth = currentYear + "-" + currentMonth;

  const text_area_widths = { epf_no: "3rem", name: "10rem" };
  const default_hidden_columns = ["gross_salary", "ot_y", "deductions_y"];

  const emptyNewMonthly = (fields) => {
    const result_obj = fields.reduce((obj, key) => {
      switch (key) {
        case "_id":
        case "__v":
          break;
        case "period":
          obj[key] = currentYearMonth;
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
        const resFields = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/fields",
          {
            params: { schema: schema },
          }
        );
        setEmployeeMonthlyDetailFields(resFields.data);
        const initialVisibleColumns = resFields.data.filter(
          (field) => !default_hidden_columns.includes(field)
        );
        setVisibleColumns(initialVisibleColumns); // Initially set visible columns

        const emptyNew = emptyNewMonthly(resFields.data);
        setNewMonthly(emptyNew);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFields("monthly-employee-details");
  }, []);

  useEffect(() => {
    if (employees) {
      let filteredEmployeesCopy = [...employees];
      // Filter by search input
      if (search) {
        filteredEmployeesCopy = filteredEmployeesCopy.filter((employee) =>
          employee.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by selected period
      if (period) {
        newMonthly["period"] = period;
        const [year, month] = period.split("-");
        filteredEmployeesCopy = filteredEmployeesCopy.map((employee) => {
          const filteredMonthlyDetails =
            employee.monthly_details?.filter((monthlyDetail) => {
              const [monthlyYear, monthlyMonth] =
                monthlyDetail.period.split("-");
              return monthlyYear === year && monthlyMonth === month;
            }) ?? [];
          return {
            ...employee,
            monthly_details: filteredMonthlyDetails,
          };
        });
      } else {
        newMonthly["period"] = currentYearMonth;
      }

      setFilteredEmployees(filteredEmployeesCopy);
    }
  }, [search, period, employees]);

  const newDataValidation = () => {
    // Generate unique id for new monthly detail
    const newMonthlyId = Date.now().toString(16).padStart(24, "0");
    newMonthly["_id"] = newMonthlyId;

    if (!newMonthly["epf_no"]) {
      if (employees.length > 0) {
        newMonthly["epf_no"] = employees[0].epf_no;
      } else {
        alert(`No Employees in the company.`);
        return false;
      }
    }
    if (!newMonthly["gross_salary"]) {
      if (employees.length > 0) {
        if (employees[0].gross_salary) {
          newMonthly["gross_salary"] = employees[0].gross_salary;
        } else {
          alert(`There should be a gross salary`);
          return false;
        }
      } else {
        alert(`No Employees in the company.`);
        return false;
      }
    }

    if (!newMonthly["period"]) {
      alert(`Period cannot be blank.`);
      return false;
    }

    employeeMonthlyDetailFields.map((field) => {
      switch (field) {
        case "_id":
        case "__v":
          break;
        default:
          let e = document.getElementById(`monthly-${field}-new`);
          if (e) {
            e.id = `monthly-${field}-new-${newMonthlyId}`;
          }
      }
    });

    return true;
  };

  const handleClick = async (e) => {
    switch (e.target.id) {
      case "monthly-add-btn":
        if (newDataValidation()) {
          const employee_index = employees.findIndex(
            (employee) => employee.epf_no == newMonthly.epf_no
          );
          if (!employees[employee_index].monthly_details) {
            employees[employee_index].monthly_details = [];
          }
          employees[employee_index].monthly_details.push(newMonthly);
          const emptyNew = emptyNewMonthly(employeeMonthlyDetailFields);
          setNewMonthly(emptyNew);
          setFilteredEmployees([...employees]);
        }
        break;
      default:
        if (e.target.id.startsWith("monthly-del-btn-")) {
          const match = e.target.id.match(/^monthly-del-btn-(.+)-(.+)$/);
          const epf_no = match[1];
          const monthly_id = match[2];

          const index_employee = employees.findIndex(
            // eslint-disable-next-line
            (item) => item["epf_no"] == epf_no
          );
          const index_monthly = employees[
            index_employee
          ].monthly_details.findIndex((item) => item["_id"] === monthly_id);
          employees[index_employee].monthly_details.splice(index_monthly, 1);

          const index_employee_filtered = filteredEmployees.findIndex(
            // eslint-disable-next-line
            (item) => item["epf_no"] == epf_no
          );
          const index_monthly_filtered = filteredEmployees[
            index_employee_filtered
          ].monthly_details.findIndex((item) => item["_id"] === monthly_id);
          filteredEmployees[index_employee_filtered].monthly_details.splice(
            index_monthly_filtered,
            1
          );
          setFilteredEmployees([...filteredEmployees]);
        }
    }
  };

  const handleChange = async (e) => {
    let value;

    switch (e.target.type) {
      case "checkbox":
        value = e.target.checked;
        // Handle column visibility change
        const match_show_field = e.target.id.match(/^show_field-(.+)$/);
        if (match_show_field) {
          const field_name = match_show_field[1];
          if (e.target.checked) {
            setVisibleColumns((prevColumns) => [...prevColumns, field_name]);
          } else {
            setVisibleColumns((prevColumns) =>
              prevColumns.filter((column) => column !== field_name)
            );
          }
        }
        break;
      default:
        value = e.target.value;
    }

    if (e.target.id === "search-input-monthly") {
      setSearch(value);
    }
    if (e.target.id === "monthly-period-selection") {
      setPeriod(value);
    }
    if (e.target.id.startsWith("monthly") && e.target.id.endsWith("new")) {
      // Extract field_name and _id using regex
      const match = e.target.id.match(/^monthly-(.+)-(.+)$/);
      if (match) {
        const field_name = match[1]; // Extracted field_name
        if (field_name == "epf_no") {
          const employee = employees.find(
            (employee) => employee.epf_no == value
          );
          document.getElementById("monthly-gross_salary-new").value =
            employee.gross_salary;
          newMonthly.gross_salary = employee.gross_salary;
        }
        console.log(field_name, value);
        newMonthly[field_name] = value;
      }
    }
  };

  const MonthlyDetailRows = ({ employee }) => {
    // Check if employee is not provided add Employee
    if (!employee) {
      if (disabled || !employees || !(employees.length > 0)) {
        return null;
      }
      return (
        <>
          <tr key={"monthly-row-new"}>
            <td colSpan={2}>
              {employees && employees.length > 0 && (
                <DropdownInput
                  keyName={"monthly-epf_no-new"}
                  optionKeys={employees.map((employee, i) => employee.epf_no)}
                  optionVals={employees.map(
                    (employee) => employee.name + " - " + employee.epf_no
                  )}
                  handleChangeFunction={handleChange}
                  disabled={disabled} // Pass disabled prop
                />
              )}
            </td>
            {employeeMonthlyDetailFields.map((field) => {
              if (visibleColumns.includes(field)) {
                switch (field) {
                  case "_id":
                    return null; // Skip rendering _id field
                  case "gross_salary":
                    return (
                      <td key={`${field}-new`} className="text-left">
                        <TextInput
                          key_name={`monthly-${field}-new`}
                          value={employees[0].gross_salary}
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                          width={text_area_widths[field]}
                        />
                      </td>
                    );
                  case "period":
                    return (
                      <td key={`${field}-new`} className="text-left">
                        <MonthInput
                          key_name={`monthly-${field}-new`}
                          value={period || currentYearMonth}
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                        />
                      </td>
                    );
                  default:
                    return (
                      <td key={`${field}-new`} className="text-left">
                        <TextInput
                          key_name={`monthly-${field}-new`}
                          value={""}
                          handleChangeFunction={handleChange}
                          disabled={disabled} // Pass disabled prop
                          width={text_area_widths[field]}
                        />
                      </td>
                    );
                }
              } else {
                return null;
              }
            })}
            <td className="txt-center">
              <button
                className="btn btn-outline-success"
                id={`monthly-add-btn`}
                onClick={handleClick}
                disabled={disabled}
              >
                Add
              </button>
            </td>
          </tr>
        </>
      );
    } else {
      if (!employee.monthly_details) {
        return null;
      }
      return (
        <>
          {employee.monthly_details.map((monthlyDetail, index) => (
            <tr key={index}>
              <td>{employee.epf_no}</td>
              <td>{employee.name}</td>
              {employeeMonthlyDetailFields.map((field) => {
                if (visibleColumns.includes(field)) {
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
                            key_name={`monthly-${field}-${employee.epf_no}-${monthlyDetail._id}`}
                            value={monthlyDetail ? monthlyDetail[field] : ""}
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
                            key_name={`monthly-${field}-${employee.epf_no}-${monthlyDetail._id}`}
                            value={monthlyDetail ? monthlyDetail[field] : ""}
                            handleChangeFunction={handleChangeFunction}
                            disabled={disabled} // Pass disabled prop
                            width={text_area_widths[field]}
                          />
                        </td>
                      );
                  }
                } else {
                  return null;
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
          key_name={"monthly-period-selection"}
          handleChangeFunction={handleChange}
          value={""}
        />
      </div>
      <input
        type="text"
        className="form-control mb-3"
        id="search-input-monthly"
        placeholder="Search Employee..."
        onChange={handleChange}
      />
      <div className="mt-2 mb-2">
        <p className="h5">Select columns to display:</p>
        <div className="d-flex flex-wrap">
          {employeeMonthlyDetailFields.map((field) => {
            switch (field) {
              case "_id":
              case "__v":
                return null;
              default:
                return (
                  <div key={field + "check_box"} className="me-3 mb-3">
                    <label
                      className="form-check-label"
                      htmlFor={"show_field-" + field}
                    >
                      {" " + field.replace(/_/g, " ").toUpperCase()}
                    </label>
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={"show_field-" + field}
                        onChange={handleChange}
                        checked={visibleColumns.includes(field)}
                      />
                    </div>
                  </div>
                );
            }
          })}
        </div>
      </div>
      <div className="scrollable mt-2">
        <table className="table table-responsive table-hover">
          <thead>
            <tr>
              <th>
                <TableKey key_name={"EPF NO"} />
                <MinWidthSetTextArea width={text_area_widths["epf_no"]} />
              </th>
              <th>
                <TableKey key_name={"NAME"} />
                <MinWidthSetTextArea width={text_area_widths["name"]} />
              </th>

              {employeeMonthlyDetailFields.map((field) => {
                if (visibleColumns.includes(field)) {
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
                          <MinWidthSetTextArea
                            width={text_area_widths[field]}
                          />
                        </th>
                      );
                  }
                } else {
                  return null;
                }
              })}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                // Check if monthly_details exist for the employee
                if (
                  employee.monthly_details &&
                  employee.monthly_details.length > 0
                ) {
                  return (
                    <MonthlyDetailRows
                      key={employee.epf_no}
                      employee={employee}
                    />
                  );
                }
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No employees found.
                </td>
              </tr>
            )}
            <MonthlyDetailRows />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyEmployeeDetailsTable;
