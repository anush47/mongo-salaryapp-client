import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DropdownInput,
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

  const text_area_widths = {
    epf_reference_no: "6rem",
    epf_payment_method: "6rem",
    etf_payment_method: "6rem",
    epf_cheque_no: "5rem",
    etf_cheque_no: "6rem",
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
      // Filter by search input
      // if (search) {
      //   filteredPaymentsCopy = filteredPaymentsCopy.filter((payment) =>
      //     payment.name.toLowerCase().includes(search.toLowerCase())
      //   );
      // }

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
  }, [search, period, monthly_payments]);

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
        value = e.target.checked;
        break;
      default:
        value = e.target.value;
    }

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
        console.log(field_name, value);
        newPayment[field_name] = value;
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
                    />
                  </td>
                );
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
      <div className="scrollable mt-2">
        <table className="table table-responsive table-hover">
          <thead>
            <tr>
              {monthlyPaymentFields.map((field) => {
                switch (field) {
                  case "_id":
                  case "__v":
                    return null;

                  default:
                    return (
                      <th
                        key={field}
                        style={{
                          width: text_area_widths[field]
                            ? text_area_widths[field]
                            : "auto",
                        }}
                      >
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
