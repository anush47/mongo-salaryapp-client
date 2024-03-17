import "bootstrap/dist/css/bootstrap.min.css";
import {
  TextInput,
  CheckBoxInput,
  TableKey,
  DateInput,
  PaymentMethodInput,
} from "../Components/InputComponents";
import "./tablestyle.css";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function AddCompanyTable() {
  const [newDetails, setNewDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFields = async (schema) => {
      try {
        const resFields = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/fields",
          {
            params: { schema: schema },
          }
        );
        const resultObject = resFields.data.reduce((obj, key) => {
          switch (key) {
            case "active_status":
            case "epf_required":
            case "etf_required":
            case "salary_sheets_required":
            case "pay_slips_required":
              obj[key] = true;
              break;

            case "_id":
              break;

            case "employees":
            case "monthly_payments":
              obj[key] = [];
              break;

            default:
              obj[key] = null;
              break;
          }
          return obj;
        }, {});

        setNewDetails(resultObject);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFields("company");
  }, []);

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

    newDetails[e.id] = value;
  };

  const dataValidation = () => {
    if (!newDetails["name"]) {
      alert("Please enter a company name.");
      return false;
    } else {
      return true;
    }
  };

  const addCompany = async () => {
    if (dataValidation()) {
      try {
        const addCompanyResponse = await axios.post(
          process.env.REACT_APP_SERVER_URL + "/add-company",
          newDetails
        );
        alert(addCompanyResponse.data.message);
        console.log(addCompanyResponse.data);
        navigate("/companies");
      } catch (error) {
        if (error.response && error.response.status === 400) {
          if (
            error.response.data.error &&
            error.response.data.error.startsWith("Duplicate key error")
          ) {
            alert(
              "Duplicate key error. Please ensure that your data is unique."
            );
          } else if (error.response.data.error === "Validation error") {
            // Handle validation errors
            const validationErrors = error.response.data.details.join("\n");
            alert(`Validation error:\n${validationErrors}`);
          } else {
            // Handle other 400 errors
            alert("Invalid data. Please check the provided information.");
          }
        } else {
          // Handle other errors
          alert(
            "An error occurred while adding the company. Please try again later."
          );
        }
        console.error(error);
      }
    }
  };

  const handleClick = async (e) => {
    switch (e.target.id) {
      case "add-btn":
        await addCompany();
        break;
      // Add more cases as needed
      default:
        // Default case for handling other button names or cases
        break;
    }
  };

  return (
    <div>
      <div className="text-start">
        <Link to={"/companies"}>
          <button className="btn btn-outline-dark me-2">Back</button>
        </Link>
        <button id="add-btn" onClick={handleClick} className="btn btn-success">
          Add
        </button>
      </div>
      <div className="scrollable mt-2">
        <div id="company-section" className="h3 mb-3">
          <b>Company Details</b>
        </div>
        <table className="table table-responsive">
          <tbody>
            {Object.entries(newDetails).map(([key, value]) => {
              switch (key) {
                case "_id":
                case "__v":
                case "employees":
                case "monthly_payments":
                  break;
                case "default_epf_payment_method":
                case "default_etf_payment_method":
                  return (
                    <tr key={key}>
                      <th>
                        <TableKey key_name={key} />
                      </th>
                      <td>
                        <PaymentMethodInput
                          key_name={key}
                          value={value}
                          handleChangeFunction={handleChange}
                          handleChangeElementFunction={handleChangeElement}
                        />
                      </td>
                    </tr>
                  );
                case "active":
                case "epf_required":
                case "etf_required":
                case "salary_sheets_required":
                case "pay_slips_required":
                  return (
                    <tr key={key}>
                      <th>
                        <TableKey key_name={key} />
                      </th>
                      <td>
                        <div className="form-check form-switch">
                          <CheckBoxInput
                            key_name={key}
                            value={value}
                            handleChangeFunction={handleChange}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                case "start_day":
                case "start_day_by_me":
                  return (
                    <tr key={key}>
                      <th>
                        <TableKey key_name={key} />
                      </th>
                      <td>
                        <DateInput
                          key_name={key}
                          value={value}
                          handleChangeFunction={handleChange}
                        />
                      </td>
                    </tr>
                  );
                default:
                  return (
                    <tr key={key}>
                      <th>
                        <TableKey key_name={key} />
                      </th>
                      <td>
                        <TextInput
                          key_name={key}
                          value={value}
                          handleChangeFunction={handleChange}
                        />
                      </td>
                    </tr>
                  );
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddCompanyTable;
