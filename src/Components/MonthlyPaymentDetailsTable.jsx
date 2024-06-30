import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckBoxInput,
  DateInput,
  DropdownInput,
  MinWidthSetTextArea,
  MonthInput,
  TableKey,
  TextInput,
} from "./InputComponents";
import {
  generate_payment_detail,
  get_ref_no,
} from "../GenerationScripts/CalculatePayment";

function MonthlyPaymentDetailsTable({
  company,
  monthly_payments,
  handleChangeFunction,
  disabled,
}) {
  const additionalFields = ["get", "delete", "generate", "print"];
  const default_hidden_columns = [
    //"epf_collected_day",
    "epf_payment_method",
    "epf_amount",
    "epf_cheque_no",
    //"etf_collected_day",
    "etf_payment_method",
    "etf_amount",
    "etf_cheque_no",
    "my_payment",
    "get",
    "delete",
    "generate",
  ];
  const [search, setSearch] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [monthlyPaymentFields, setMonthlyPaymentFields] = useState([]);
  const [period, setPeriod] = useState("");
  const [newPayment, setNewPayment] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    additionalFields.filter((field) => {
      return !default_hidden_columns.includes(field);
    })
  );
  const [paymentProcessingState, setPaymentProcessingState] = useState(false);

  let previousYearMonth,
    nextDay = "";
  const setDays = () => {
    const currentDate = new Date();
    const previousMonth =
      currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
    const currentYear =
      currentDate.getMonth() === 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear();
    previousYearMonth = `${currentYear}-${String(previousMonth).padStart(
      2,
      "0"
    )}`;
    nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  };

  setDays();

  const setup_columns = () => {
    if (!company["default_epf_payment_method"]) {
      default_hidden_columns.push("epf_payment_method");
      if (company["default_epf_payment_method"] !== "Cash") {
        default_hidden_columns.push("epf_cheque_no");
      }
    }

    if (!company["default_etf_payment_method"]) {
      default_hidden_columns.push("etf_payment_method");
      if (company["default_etf_payment_method"] !== "Cash") {
        default_hidden_columns.push("etf_cheque_no");
      }
    }
  };

  setup_columns();
  let setted = false;
  useEffect(() => {
    if (company && !setted) {
      if (!company["default_epf_payment_method"]) {
        visibleColumns.push("epf_payment_method");
        const e_epm = document.getElementById("show_field-epf_payment_method");
        if (e_epm) {
          e_epm.checked = true;
        } else {
          return;
        }
      } else {
        if (company["default_epf_payment_method"] !== "Cash") {
          visibleColumns.push("epf_cheque_no");
          const ecn = document.getElementById("show_field-epf_cheque_no");
          if (ecn) {
            ecn.checked = true;
          } else {
            return;
          }
        }
      }

      if (!company["default_etf_payment_method"]) {
        visibleColumns.push("etf_payment_method");
        const epm2 = document.getElementById("show_field-etf_payment_method");
        if (epm2) {
          epm2.checked = true;
        } else {
          return;
        }
      } else {
        if (company["default_etf_payment_method"] !== "Cash") {
          visibleColumns.push("etf_cheque_no");
          const ecn2 = document.getElementById("show_field-etf_cheque_no");
          if (ecn2) {
            ecn2.checked = true;
          } else {
            return;
          }
        }
      }
      setted = true;
    }
  }, [company]);

  const text_area_widths = {
    // epf_reference_no: "8rem",
    // epf_payment_method: "6rem",
    // etf_payment_method: "6rem",
    // epf_cheque_no: "5rem",
    // etf_cheque_no: "5rem",
  };

  const emptyNewPayment = (fields, period = null) => {
    const result_obj = fields.reduce((obj, key) => {
      switch (key) {
        case "_id":
        case "__v":
          break;
        case "period":
          obj[key] = period || previousYearMonth;
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
        const initialVisibleColumns = [
          ...additionalFields.filter(
            (field) => !default_hidden_columns.includes(field)
          ),
          ...resFields.data.filter(
            (field) => !default_hidden_columns.includes(field)
          ),
        ];
        setVisibleColumns(initialVisibleColumns); // Initially set visible columns

        const emptyNew = emptyNewPayment(resFields.data);
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
        const [year, month] = period.split("-");
        filteredPaymentsCopy =
          filteredPaymentsCopy?.filter((payment) => {
            const [monthlyYear, monthlyMonth] = payment.period.split("-");
            return monthlyYear === year && monthlyMonth === month;
          }) ?? [];
      }

      setFilteredPayments(filteredPaymentsCopy);
      change_new_accordingly(period);
    }
  }, [period, monthly_payments]);

  useEffect(() => {
    if (disabled !== undefined && !disabled) {
      //change_new_accordingly(newPayment[period] || previousYearMonth);
      if (!newPayment) {
        newPayment = {};
      }
      newPayment.period = period || previousYearMonth;
    }
  }, [disabled]);

  const newDataValidation = () => {
    if (!newPayment["period"]) {
      alert(`Period cannot be blank.`);
      return false;
    }

    if (
      monthly_payments.find((payment) => payment.period == newPayment.period)
    ) {
      alert(`Payment for period ${newPayment.period} already exists.`);
      return false;
    }

    if (!newPayment["epf_amount"] || !newPayment["etf_amount"]) {
      alert(`EPF and ETF amounts cannot be blank`);
      return false;
    }

    // Generate unique id for new monthly detail
    const newPaymentId = Date.now().toString(16).padStart(24, "0");
    newPayment["_id"] = newPaymentId;
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
    //console.log(e.target.id);
    switch (e.target.id) {
      case "payment-add-btn":
        if (newDataValidation()) {
          monthly_payments.push(newPayment);
          console.log(newPayment);
          const emptyNew = emptyNewPayment(monthlyPaymentFields);
          setNewPayment(emptyNew);
          setFilteredPayments([...monthly_payments]);
        }
        break;

      case "payment-gen-btn":
        setPaymentProcessingState(true);
        console.log(newPayment.period);
        change_new_accordingly(newPayment.period);
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
        } else if (e.target.id.startsWith("payment-epf_reference_no-getbtn-")) {
          const match = e.target.id.match(
            /^payment-epf_reference_no-getbtn-(.+)$/
          );
          setPaymentProcessingState(true);
          const _id = match[1];
          const index_monthly = monthly_payments.findIndex(
            (item) => item["_id"] === _id
          );
          monthly_payments[index_monthly].epf_reference_no = await get_ref_no(
            company,
            monthly_payments[index_monthly].period
          );
          setFilteredPayments(monthly_payments);
          setPaymentProcessingState(false);
        } else if (
          e.target.id.startsWith("payment-epf-getbtn-") ||
          e.target.id.startsWith("payment-etf-getbtn-") ||
          e.target.id.startsWith("payment-salary-getbtn-") ||
          e.target.id.startsWith("payment-all-getbtn-") ||
          e.target.id.startsWith("payment-all_printable-getbtn-")
        ) {
          const match = e.target.id.match(/^payment-(.+)-getbtn-(.+)$/);
          const type = match[1];
          const _id = match[2];
          //get period
          const index_monthly = monthly_payments.findIndex(
            (item) => item["_id"] === _id
          );
          await download_pdf(
            company,
            monthly_payments[index_monthly].period,
            type
          );
        }
    }
  };

  useEffect(() => {
    if (!newPayment) return;
    Object.keys(newPayment).forEach((key) => {
      const e = document.getElementById(`payment-${key}-new`);
      if (e) {
        switch (key) {
          case "epf_amount":
          case "etf_amount":
          case "my_payment":
            e.value =
              typeof newPayment[key] === "number"
                ? newPayment[key].toFixed(2)
                : "";
            break;

          default:
            e.value = newPayment[key] || "";
            break;
        }
      }
    });
  }, [visibleColumns]);

  useEffect(() => {
    if (!newPayment) return;
    Object.keys(newPayment).forEach((key) => {
      const e = document.getElementById(`payment-${key}-new`);
      if (e) {
        switch (key) {
          case "epf_amount":
          case "etf_amount":
          case "my_payment":
            e.value =
              typeof newPayment[key] === "number"
                ? newPayment[key].toFixed(2)
                : "";
            break;

          default:
            e.value = newPayment[key] || "";
            break;
        }
        //console.log(key, emptyNew[key]);
      }
    });
  }, [newPayment]);

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
            if (field_name === "period") {
              change_new_accordingly(value);
            }
          }
        }
    }
  };

  const change_new_accordingly = async (period) => {
    if (disabled) return;
    console.log(period);
    setPaymentProcessingState(true);
    setNewPayment(emptyNewPayment(monthlyPaymentFields, period));
    const payment = await generate_payment_detail(
      company,
      period,
      monthlyPaymentFields
    );
    //console.log(payment);
    setNewPayment(payment);
    setPaymentProcessingState(false);
  };

  const download_pdf = async (company, period, type, epf_no = "") => {
    try {
      if (!period || !type) {
        throw new Error("Period and Type are required.");
      }
      setPaymentProcessingState(true);

      const params = {
        employer_no: company.employer_no,
        period: period,
        type: type,
        epf_no: epf_no, // Only required for payslip type
      };

      const res = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/generate-pdf`,
        {
          params: params,
          responseType: "blob", // Ensure response type is blob for PDF
        }
      );

      const filename = (() => {
        const contentDisposition = res.headers["content-disposition"];
        if (contentDisposition) {
          const match = contentDisposition.match(/filename = "(.+)"/);
          if (match) return match[1];
        }
        return `${company.name} - ${period} - ${type}.pdf`; // Default filename
      })();

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. " + error.message);
    } finally {
      setPaymentProcessingState(false);
    }
  };

  const MonthlyPaymentRow = ({ payment }) => {
    // Check if employee is not provided
    if (!payment) {
      //New Payment
      if (disabled) {
        return null;
      }
      return (
        <tr>
          {monthlyPaymentFields.map((field) => {
            if (visibleColumns.includes(field)) {
              switch (field) {
                case "_id":
                  return null;

                case "period":
                  return (
                    <td key={field + "new"} className="text-left">
                      <MonthInput
                        key_name={"payment-" + field + "-new"}
                        value={previousYearMonth}
                        handleChangeFunction={handleChange}
                        disabled={disabled || paymentProcessingState}
                      />
                    </td>
                  );

                case "epf_collected_day":
                case "epf_paid_day":
                case "etf_collected_day":
                case "etf_paid_day":
                  return (
                    <td key={field + "new"} className="text-left">
                      <DateInput
                        key_name={"payment-" + field + "-new"}
                        value={""}
                        handleChangeFunction={handleChange}
                        disabled={disabled || paymentProcessingState}
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
                        disabled={disabled || paymentProcessingState}
                        width={text_area_widths[field]}
                      />
                    </td>
                  );
              }
            }
          })}

          {additionalFields.map((field) => {
            if (visibleColumns.includes(field)) {
              switch (field) {
                case "print":
                  return (
                    <td className="text-center" key={field + "new"}>
                      <button
                        id="payment-gen-btn"
                        onClick={handleClick}
                        className="btn btn-outline-success m-1"
                        disabled={disabled || paymentProcessingState}
                      >
                        Gen
                      </button>
                      <button
                        id="payment-add-btn"
                        onClick={handleClick}
                        className="btn btn-success m-1"
                        disabled={disabled || paymentProcessingState}
                      >
                        Add
                      </button>
                    </td>
                  );
                case "generate":
                  return (
                    <td className="text-center" key={field + "new"}>
                      <button
                        id="payment-gen-btn"
                        onClick={handleClick}
                        className="btn btn-outline-success m-1"
                        disabled={disabled || paymentProcessingState}
                      >
                        Gen
                      </button>
                      <button
                        id="payment-add-btn"
                        onClick={handleClick}
                        className="btn btn-success m-1"
                        disabled={disabled || paymentProcessingState}
                      >
                        Add
                      </button>
                    </td>
                  );
                default:
                  return null;
              }
            }
          })}
        </tr>
      );
    } else {
      //existing payment
      return (
        <tr>
          {monthlyPaymentFields.map((field) => {
            if (visibleColumns.includes(field)) {
              switch (field) {
                case "_id":
                  return null;

                case "period":
                  return (
                    <td key={field + payment._id} className="text-left">
                      <MonthInput
                        key_name={"payment-" + field + "-" + payment._id}
                        value={payment[field]}
                        handleChangeFunction={handleChangeFunction}
                        disabled={disabled || paymentProcessingState}
                      />
                    </td>
                  );

                case "epf_reference_no":
                  return (
                    <td key={field + payment._id} className="text-left">
                      <TextInput
                        key_name={"payment-" + field + "-" + payment._id}
                        value={payment[field] || ""} // Use empty string if value is falsy
                        handleChangeFunction={handleChangeFunction}
                        disabled={disabled || paymentProcessingState}
                        width={text_area_widths[field]}
                      />
                    </td>
                  );

                case "epf_collected_day":
                case "epf_paid_day":
                case "etf_collected_day":
                case "etf_paid_day":
                  return (
                    <td key={field + payment._id} className="text-left">
                      <DateInput
                        key_name={"payment-" + field + "-" + payment._id}
                        value={payment[field]}
                        handleChangeFunction={handleChangeFunction}
                        disabled={disabled || paymentProcessingState}
                      />
                    </td>
                  );

                case "epf_amount":
                case "etf_amount":
                case "my_payment":
                  return (
                    <td key={field + payment._id} className="text-left">
                      <TextInput
                        key_name={"payment-" + field + "-" + payment._id}
                        value={
                          typeof payment[field] === "number" ||
                          !isNaN(parseFloat(payment[field]))
                            ? parseFloat(payment[field]).toFixed(2)
                            : ""
                        } // Use empty string if value is falsy
                        handleChangeFunction={handleChangeFunction}
                        disabled={disabled || paymentProcessingState}
                        width={text_area_widths[field]}
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
                        disabled={disabled || paymentProcessingState}
                        width={text_area_widths[field]}
                      />
                    </td>
                  );
              }
            } else {
              return null;
            }
          })}

          {additionalFields.map((field) => {
            if (visibleColumns.includes(field)) {
              switch (field) {
                case "get":
                  return (
                    <td key={field + payment._id} className="txt-center">
                      <button
                        className="btn btn-outline-dark"
                        id={"payment-epf_reference_no-getbtn-" + payment._id}
                        onClick={handleClick}
                        disabled={disabled || paymentProcessingState}
                      >
                        Get ref no
                      </button>
                    </td>
                  );
                case "generate":
                  return (
                    <td key={field + payment._id} className="txt-center">
                      <button
                        className="btn m-1 btn-outline-dark"
                        id={"payment-epf-getbtn-" + payment._id}
                        onClick={handleClick}
                        disabled={paymentProcessingState}
                      >
                        EPF
                      </button>
                      <button
                        className="btn m-1 btn-outline-dark"
                        id={"payment-etf-getbtn-" + payment._id}
                        onClick={handleClick}
                        disabled={paymentProcessingState}
                      >
                        ETF
                      </button>
                      <button
                        className="btn m-1 btn-outline-dark"
                        id={"payment-salary-getbtn-" + payment._id}
                        onClick={handleClick}
                        disabled={paymentProcessingState}
                      >
                        Salary
                      </button>
                      <button
                        className="btn m-1 btn-outline-dark"
                        id={"payment-all-getbtn-" + payment._id}
                        onClick={handleClick}
                        disabled={paymentProcessingState}
                      >
                        All
                      </button>
                    </td>
                  );
                case "print":
                  return (
                    <td key={field + payment._id} className="txt-center">
                      <button
                        className="btn m-1 btn-outline-success"
                        id={"payment-all_printable-getbtn-" + payment._id}
                        onClick={handleClick}
                        disabled={paymentProcessingState}
                      >
                        Print
                      </button>
                    </td>
                  );

                case "delete":
                  return (
                    <td key={field + payment._id} className="txt-center">
                      <button
                        className="btn btn-outline-danger m-1"
                        id={"payment-del-btn-" + payment._id}
                        onClick={handleClick}
                        disabled={disabled || paymentProcessingState}
                      >
                        Delete
                      </button>
                    </td>
                  );

                default:
                  return null;
              }
            }
          })}
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
          disabled={paymentProcessingState}
        />
      </div>

      {/* <input
        type="text"
        className="form-control mb-3"
        id="search-input-payment"
        placeholder="Search Employee..."
        onChange={handleChange}
      /> */}

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
          {additionalFields.map((field) => {
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
          })}
        </div>
      </div>

      <div className="mt-2" style={{ overflowY: "auto", maxHeight: "500px" }}>
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
              {additionalFields.map((field) => {
                if (visibleColumns.includes(field)) {
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
