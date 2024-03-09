import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckBoxInput,
  DropdownInput,
  MinWidthSetTextArea,
  MonthInput,
  TableKey,
  TextInput,
} from "./InputComponents";

function MonthlyPaymentDetailsTable({
  company,
  monthly_payments,
  handleChangeFunction,
  disabled,
}) {
  const [search, setSearch] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [monthlyPaymentFields, setMonthlyPaymentFields] = useState([]);
  const [period, setPeriod] = useState("");
  const [newPayment, setNewPayment] = useState({});
  const [visibleColumns, setVisibleColumns] = useState([]);

  const text_area_widths = {
    epf_reference_no: "8rem",
    epf_payment_method: "6rem",
    etf_payment_method: "6rem",
    epf_cheque_no: "5rem",
    etf_cheque_no: "5rem",
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
    const fetchFields = async (schema) => {
      try {
        const resFields = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/fields",
          {
            params: { schema: schema },
          }
        );
        setMonthlyPaymentFields(resFields.data);
        setVisibleColumns(resFields.data); // Initially set visible columns to all fields
        const emptyNew = emptyNewMonthly(resFields.data);
        setNewPayment(emptyNew);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFields("monthly-payments");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (monthly_payments) {
      let filteredPaymentsCopy = [...monthly_payments];
      // Filter by selected period
      if (period) {
        newPayment["period"] = period;
        const [year, month] = period.split("-");
        filteredPaymentsCopy =
          filteredPaymentsCopy?.filter((payment) => {
            const [monthlyYear, monthlyMonth] = payment.period.split("-");
            return monthlyYear === year && monthlyMonth === month;
          }) ?? [];
      }

      setFilteredPayments(filteredPaymentsCopy);
    }
  }, [period, monthly_payments]);

  const newDataValidation = () => {
    // Generate unique id for new monthly detail
    const newPaymentId = Date.now().toString(16).padStart(24, "0");
    newPayment["_id"] = newPaymentId;

    if (!newPayment["period"]) {
      alert(`Period cannot be blank.`);
      return false;
    }

    monthlyPaymentFields.map((field) => {
      switch (field) {
        case "_id":
        case "__v":
          break;
        default:
          let e = document.getElementById(`payment-${field}-new`);
          if (e) {
            e.id = `monthly-${field}-new-${newPaymentId}`;
          }
      }
    });
    return true;
  };

  const handleClick = async (e) => {
    switch (e.target.id) {
      case "payment-add-btn":
        if (newDataValidation()) {
          monthly_payments.push(newPayment);
          const emptyNew = emptyNewMonthly(monthlyPaymentFields);
          setNewPayment(emptyNew);
          setFilteredPayments([...monthly_payments]);
        }
        break;
      default:
        if (e.target.id.startsWith("payment-del-btn-")) {
          const match = e.target.id.match(/^payment-del-btn-(.+)$/);
          const _id = match[1];
          const index_monthly = monthly_payments.findIndex(
            (item) => item["_id"] === _id
          );
          monthly_payments.splice(index_monthly, 1);
          setFilteredPayments([...monthly_payments]);
        }
    }
  };

  const handleChange = async (e) => {
    let value;

    switch (e.target.type) {
      case "checkbox":
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
        if (e.target.id === "search-input-payment") {
          setSearch(value);
        }
        if (e.target.id === "payment-period-selection") {
          setPeriod(value);
        }
        if (e.target.id.startsWith("payment") && e.target.id.endsWith("new")) {
          // Extract field_name and _id using regex
          const match = e.target.id.match(/^payment-(.+)-(.+)$/);
          if (match) {
            const field_name = match[1]; // Extracted field_name
            newPayment[field_name] = value;
          }
        }
    }
  };

  const MonthlyPaymentRow = ({ payment }) => {
    // Check if employee is not provided
    if (!payment) {
      if (disabled) {
        return null;
      }
      return (
        <tr>
          {monthlyPaymentFields.map((field) => {
            switch (field) {
              case "_id":
                return null;

              case "period":
                return (
                  <td key={field + "new"} className="text-left">
                    <MonthInput
                      key_name={"payment-" + field + "-new"}
                      value={period}
                      handleChangeFunction={handleChange}
                      disabled={disabled}
                    />
                  </td>
                );
              case "epf_collected_day":
              case "epf_paid_day":
              case "etf_collected_day":
              case "etf_paid_day":
                return (
                  <td key={field + "new"} className="text-left">
                    <MonthInput
                      key_name={"payment-" + field + "-new"}
                      value={""}
                      handleChangeFunction={handleChange}
                      disabled={disabled}
                    />
                  </td>
                );

              default:
                return (
                  <td key={field + "new"}>
                    <TextInput
                      key_name={"payment-" + field + "-new"}
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
              id="payment-add-btn"
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
          {monthlyPaymentFields.map((field) => {
            if (visibleColumns.includes(field)) {
              switch (field) {
                case "_id":
                  return null;

                case "period":
                case "epf_collected_day":
                case "epf_paid_day":
                case "etf_collected_day":
                case "etf_paid_day":
                  return (
                    <td key={field + payment._id} className="text-left">
                      <MonthInput
                        key_name={"payment-" + field + "-" + payment._id}
                        value={payment[field]}
                        handleChangeFunction={handleChangeFunction}
                        disabled={disabled}
                      />
                    </td>
                  );

                default:
                  return (
                    <td key={field + payment._id} className="text-left">
                      <TextInput
                        key_name={"payment-" + field + "-" + payment._id}
                        value={payment[field] || ""} // Use empty string if value is falsy
                        handleChangeFunction={handleChangeFunction}
                        disabled={disabled}
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
              id={"payment-del-btn-" + payment._id}
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
      <div className="mb-3 d-flex align-items-center">
        <p className="h6 me-2">Period :</p>{" "}
        <MonthInput
          key_name={"payment-period-selection"}
          handleChangeFunction={handleChange}
          value={""}
        />
      </div>

      <input
        type="text"
        className="form-control mb-3"
        id="search-input-payment"
        placeholder="Search Employee..."
        onChange={handleChange}
      />

      <div className="mt-2 mb-2">
        <p className="h5">Select columns to display:</p>
        <div className="d-flex flex-wrap">
          {monthlyPaymentFields.map((field) => {
            switch (field) {
              case "_id":
              case "__v":
              case "period":
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
                      <CheckBoxInput
                        key_name={"show_field-" + field}
                        value={visibleColumns.includes(field)}
                        handleChangeFunction={handleChange}
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
              {monthlyPaymentFields.map((field) => {
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
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => {
                return (
                  <MonthlyPaymentRow key={payment.period} payment={payment} />
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No payments found.
                </td>
              </tr>
            )}
            <MonthlyPaymentRow />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyPaymentDetailsTable;
