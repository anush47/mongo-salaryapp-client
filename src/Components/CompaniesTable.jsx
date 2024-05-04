import "bootstrap/dist/css/bootstrap.min.css";
import "./tablestyle.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckBoxInput,
  DateInput,
  MonthInput,
  TableKey,
  TextInput,
} from "./InputComponents";
import { generate_monthly_details } from "../GenerationScripts/RandomGeneration";
import { generate_payment_detail } from "../GenerationScripts/CalculatePayment";

function CompaniesTable() {
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

    // console.log(nextDay);
    // console.log(previousYearMonth);
  };

  setDays();

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState();
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [monthlyPaymentFields, setMonthlyPaymentFields] = useState([]);
  const [updatedMonthlyDetails, setUpdatedMonthlyDetails] = useState([]);
  const [updatedMonthlyPayments, setUpdatedMonthlyPayments] = useState([]);
  const [monthlyDetails, setMonthlyDetails] = useState([]);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [paymentProcessingState, setPaymentProcessingState] = useState(false);
  const [showSelectedDetails, setShowSelectedDetails] = useState(false);
  const [showGeneratedDetails, setShowGeneratedDetails] = useState(true);
  const [showAllPayments, setShowAllPayments] = useState(false);

  const fields = [
    "name",
    "employer_no",
    "active",
    "active_employees",
    "monthly_gen_period",
    "monthly_include",
    "epf_cheque_no",
    "epf_collected_day",
    "epf_paid_day",
    "etf_cheque_no",
    "etf_collected_day",
    "etf_paid_day",
    "monthly_gen",
    "payment_gen",
    "manage",
  ];
  const default_hidden_columns = [
    //"monthly_gen_period",
    "monthly_include",
    "epf_collected_day",
    "etf_collected_day",
    "epf_cheque_no",
    "etf_cheque_no",
    "epf_paid_day",
    "etf_paid_day",
    //"monthly_gen",
    "employer_no",
  ];

  useEffect(() => {
    const fetchCompanies = async (val) => {
      try {
        const resCompanies = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/get-companies",
          { params: { search: val } }
        );
        setCompanies(resCompanies.data);

        resCompanies.data.forEach((company) => {
          setPaymentStatus((prevState) => ({
            ...prevState,
            [company.employer_no]: {
              period: previousYearMonth,
              epf_collected_day: nextDay,
              epf_paid_day: nextDay,
              etf_collected_day: nextDay,
              etf_paid_day: nextDay,
              include: company.active || false,
            },
          }));
        });
      } catch (error) {
        console.log(error);
      }
    };

    setVisibleColumns(
      fields.filter((field) => !default_hidden_columns.includes(field))
    );
    fetchCompanies();
  }, []);

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
      } catch (error) {
        console.log(error);
      }
    };
    fetchFields("monthly-payments");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredCompanies((prevCompanies) =>
        prevCompanies.filter((company) =>
          company.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      // if search is empty, reset filteredCompanies to the original list
      setFilteredCompanies(companies);
    }
  }, [search, companies]);

  const handleChange = async (e) => {
    //console.log(e.target.id);
    if (e.target.id === "search-input") {
      setSearch(e.target.value);
      return;
    } else if (e.target.id.startsWith("monthly-period-")) {
      const match_employer_no = e.target.id.match(/^monthly-period-(.+)$/);
      if (match_employer_no) {
        const employer_no = match_employer_no[1];
        if (employer_no == "all") {
          for (const employer_no in paymentStatus) {
            paymentStatus[employer_no].period = e.target.value;
            setPaymentStatus((prev) => ({ ...prev }));
            document.getElementById("monthly-period-" + employer_no).value =
              e.target.value;
          }
        } else {
          paymentStatus[employer_no].period = e.target.value;
          setPaymentStatus((prev) => ({ ...prev }));
        }
        return;
      }
    } else if (
      e.target.id.startsWith("monthly-include-") &&
      e.target.type === "checkbox"
    ) {
      const match_employer_no = e.target.id.match(/^monthly-include-(.+)$/);
      if (match_employer_no) {
        const employer_no = match_employer_no[1];
        paymentStatus[employer_no].include = e.target.checked;
        return;
      }
    } else if (
      e.target.id.startsWith("epf_collected_day-") ||
      e.target.id.startsWith("etf_collected_day-") ||
      e.target.id.startsWith("epf_paid_day-") ||
      e.target.id.startsWith("etf_paid_day-")
    ) {
      const match_employer_no = e.target.id.match(/^(.+)-(.+)$/);
      if (match_employer_no) {
        const key = match_employer_no[1];
        const employer_no = match_employer_no[2];
        if (employer_no == "all") {
          for (const employer_no in paymentStatus) {
            paymentStatus[employer_no][key] = e.target.value;
            document.getElementById(key + "-" + employer_no).value =
              e.target.value;
          }
          setPaymentStatus((prev) => ({ ...prev }));
        } else {
          paymentStatus[employer_no][key] = e.target.value;
        }
      }
    } else if (
      e.target.id.startsWith("epf_cheque_no-") ||
      e.target.id.startsWith("etf_cheque_no-")
    ) {
      const match_employer_no = e.target.id.match(/^(.+)-(.+)$/);
      if (match_employer_no) {
        const key = match_employer_no[1];
        const employer_no = match_employer_no[2];
        if (e.target.value != "" && paymentStatus[employer_no][key] != "") {
          paymentStatus[employer_no][key] = e.target.value;
        }
      }
    } else if (e.target.id === "show-generated") {
      setShowGeneratedDetails(e.target.checked);
    } else if (e.target.id === "show-selected") {
      setShowSelectedDetails(e.target.checked);
    }

    if (e.target.type === "checkbox") {
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
    }
  };

  const updateCompany = async (company) => {
    try {
      const updateCompanyResponse = await axios.post(
        "http://localhost:3001/update-company",
        company
      );
      console.log(updateCompanyResponse.data);
      //window.location.reload(false);
      return true;
      //navigate("/companies");
    } catch (error) {
      // Error handling
      alert(error);
      return false;
    } finally {
    }
  };

  const updateMonthlyAddedCompanies = async () => {
    let all_success = true;
    for (const company of companies) {
      if (!Object.keys(updatedMonthlyDetails).includes(company.employer_no))
        continue;
      console.log(company);
      let success = await updateCompany(company);
      if (!success) {
        alert(
          "An error occurred while updating the company " + company.name + "."
        );
        all_success = false;
      } else {
        monthlyDetails[company.employer_no] =
          updatedMonthlyDetails[company.employer_no];
        delete updatedMonthlyDetails[company.employer_no];
      }
    }
    for (const company of companies) {
      if (!Object.keys(updatedMonthlyDetails).includes(company.employer_no))
        continue;
      console.log(company);
      let success = await updateCompany(company);
      if (!success) {
        alert(
          "An error occurred while updating the company " + company.name + "."
        );
        all_success = false;
      } else {
        monthlyDetails[company.employer_no] =
          updatedMonthlyDetails[company.employer_no];
        delete updatedMonthlyDetails[company.employer_no];
      }
    }
    setUpdatedMonthlyDetails((prev) => ({ ...prev }));
    setMonthlyDetails((prev) => ({ ...prev }));
    setUpdatedMonthlyPayments((prev) => ({ ...prev }));
    setMonthlyPayments((prev) => ({ ...prev }));
    return all_success;
  };

  const updateMonthlyRemovedCompanies = async () => {
    let all_success = true;
    for (const company of companies) {
      if (!Object.keys(monthlyDetails).includes(company.employer_no)) continue;
      console.log(company);
      let success = await updateCompany(company);
      if (!success) {
        alert(
          "An error occurred while updating the company " + company.name + "."
        );
        all_success = false;
      } else {
        delete monthlyDetails[company.employer_no];
        setUpdatedMonthlyDetails((prev) => ({ ...prev }));
      }
    }
    return all_success;
  };

  useEffect(() => {
    if (companies.length > 0) {
      companies.forEach((company) => {
        set_monthlydetail_for_period_to_monthlyformat(
          company.employer_no,
          paymentStatus[company.employer_no].period
        );
        const monthly_payment = company.monthly_payments.find(
          (p) => p.period == paymentStatus[company.employer_no].period
        );
        if (monthly_payment) {
          if (!monthlyPayments[company.employer_no]) {
            monthlyPayments[company.employer_no] = {};
          }
          monthlyPayments[company.employer_no][monthly_payment.period] =
            monthly_payment;
        }
        //console.log(monthlyStatus[company.employer_no].period);
      });
    }
  }, [paymentStatus]);

  const set_monthlydetail_for_period_to_monthlyformat = (
    employer_no,
    period
  ) => {
    const company = companies.find((c) => c.employer_no === employer_no);
    if (!company) return;
    company.employees.forEach((employee) => {
      const monthly_detail = employee.monthly_details.find(
        (md) => md.period === period
      );
      if (monthly_detail) {
        //console.log(period);
        const val = Object.keys(monthly_detail).reduce((obj, key) => {
          obj[key] = monthly_detail[key];
          obj["epf_no"] = employee.epf_no;
          obj["employer_no"] = company.employer_no;
          obj["company_name"] = company.name;
          obj["employee_name"] = employee.name;
          return obj;
        }, {});
        if (!monthlyDetails[employer_no]) {
          // If it's undefined, initialize it as an empty array
          monthlyDetails[employer_no] = {};
        }
        if (!monthlyDetails[employer_no][employee.epf_no]) {
          // If it's undefined, initialize it as an empty array
          monthlyDetails[employer_no][employee.epf_no] = [];
        }
        //if the monthly detail with that period is not already in monthlyDetails, add it
        if (
          !monthlyDetails[employer_no][employee.epf_no].find(
            (md) => md.period === period
          )
        ) {
          monthlyDetails[employer_no][employee.epf_no].length = 0;
          monthlyDetails[employer_no][employee.epf_no].push(val);
        }
        //console.log(val);
      } else {
        if (
          monthlyDetails[employer_no] &&
          monthlyDetails[employer_no][employee.epf_no]
        )
          monthlyDetails[employer_no][employee.epf_no].length = 0;
      }
    });
    let del = true;
    for (const [epf_no, details] of Object.entries(
      monthlyDetails[employer_no] || {}
    )) {
      if (details.length > 0) {
        del = false;
        break;
      }
    }
    if (del) delete monthlyDetails[employer_no];
    setMonthlyDetails((prev) => ({ ...prev }));
    //console.log(monthlyDetails);
  };

  useEffect(() => {
    if (companies.length > 0) {
      companies.forEach((company) => {
        if (paymentStatus[company.employer_no]) {
          const e_period = document.getElementById(
            `monthly-period-${company.employer_no}`
          );
          const e_include = document.getElementById(
            `monthly-include-${company.employer_no}`
          );
          if (e_period) {
            e_period.value = paymentStatus[company.employer_no].period;
          }
          if (e_include) {
            e_include.checked = paymentStatus[company.employer_no].include;
          }
        }
      });
    }
  }, [visibleColumns]);

  const handleClick = async (e) => {
    if (e.target.id.startsWith("delete-company-btn-")) {
      const idArray = e.target.id.split("-");
      // Get the employer number from the id
      const employerNo = idArray[3];

      // Find the company with matching employer number
      const companyToDelete = companies.find(
        (company) => company.employer_no == employerNo
      );

      if (companyToDelete) {
        // Confirm deletion with user
        const confirmDelete = window.confirm(
          `Are you sure you want to delete ${companyToDelete.name}?`
        );

        // If user confirms deletion, proceed with deletion
        if (confirmDelete) {
          try {
            // Call the deleteCompany function with the employer number
            await deleteCompany(employerNo);
          } catch (error) {
            alert(`An error occurred while deleting the company: \n${error}`);
          }
        }
      } else {
        alert("Company not found.");
      }
    } else if (e.target.id.startsWith("monthly-gen-")) {
      const match_employer_no = e.target.id.match(/^monthly-gen-(.+)$/);
      if (match_employer_no) {
        const employer_no = match_employer_no[1];
        setPaymentProcessingState(true);
        if (employer_no == "all") {
          monthly_gen_companies(companies, paymentStatus);
        } else {
          const company = companies.find((c) => c.employer_no === employer_no);
          monthly_gen_company(company, paymentStatus[employer_no].period);
          alert(
            "Monthly details generated for " +
              company.name +
              " - " +
              paymentStatus[employer_no].period
          );
        }
        setPaymentProcessingState(false);
      }
    } else if (e.target.id.startsWith("payment-gen-")) {
      const match_employer_no = e.target.id.match(/^payment-gen-(.+)$/);
      if (match_employer_no) {
        const employer_no = match_employer_no[1];
        setPaymentProcessingState(true);
        if (employer_no == "all") {
          await payment_gen_companies(companies, paymentStatus);
        } else {
          const company = companies.find((c) => c.employer_no === employer_no);
          await payment_gen_company(company, paymentStatus[employer_no].period);
          // alert(
          //   "Monthly details generated for " +
          //     company.name +
          //     " - " +
          //     monthlyStatus[employer_no].period
          // );
        }
        setPaymentProcessingState(false);
      }
    } else if (e.target.id === "save-companies-btn") {
      let success = await updateMonthlyAddedCompanies();
      if (success) {
        alert("Companies updated successfully.");
      } else {
        alert("An error occurred while updating companies.");
      }
    } else if (e.target.id === "delete-monthly-btn") {
      //confirm

      const confirmDelete = window.confirm(
        "Are you sure you want to remove the selected monthly details?\n" +
          getMonthlyDetailsCompaniesandPeriod(monthlyDetails).join(",\n")
      );
      if (confirmDelete) {
        delete_monthly(monthlyDetails, companies);
      }
    }
  };

  const getMonthlyDetailsCompaniesandPeriod = (monthlyDetails) => {
    const companiesAndPeriods = [];

    Object.keys(monthlyDetails).forEach((employer_no) => {
      const details =
        monthlyDetails[employer_no][
          Object.keys(monthlyDetails[employer_no])[0]
        ][0];
      if (details) {
        const companyAndPeriod = details.company_name + " - " + details.period;
        companiesAndPeriods.push(companyAndPeriod);
      }
    });

    return companiesAndPeriods;
  };

  const delete_monthly = async (monthly_details, companies) => {
    for (const [employer_no, employees] of Object.entries(monthly_details)) {
      for (const [epf_no, details] of Object.entries(employees)) {
        for (const detail of details) {
          const company = companies.find((c) => c.employer_no === employer_no);
          if (company) {
            const employee = company.employees.find((e) => e.epf_no == epf_no);
            if (employee) {
              const monthly_detail = employee.monthly_details.find(
                (md) => md.period === detail.period
              );
              if (monthly_detail) {
                const index = employee.monthly_details.indexOf(monthly_detail);
                employee.monthly_details.splice(index, 1);
              }
            }
            const monthly_payment = company.monthly_payments.find(
              (mp) => mp.period === detail.period
            );
            if (monthly_payment) {
              const index = company.monthly_payments.indexOf(monthly_payment);
              company.monthly_payments.splice(index, 1);
            }
          }
        }
      }
    }
    let success = await updateMonthlyRemovedCompanies();
    if (success) {
      alert("Monthly details deleted successfully.");
      console.log(companies);
    } else {
      alert("An error occurred while updating companies.");
    }
  };

  const payment_gen_company = async (company, period) => {
    let payment = company.monthly_payments.find(
      (payment) => payment.period == period
    );

    if (payment) {
      const newEpfChequeNo = paymentStatus[company.employer_no].epf_cheque_no;
      const newEtfChequeNo = paymentStatus[company.employer_no].etf_cheque_no;
      const newEpfCollectedDay =
        paymentStatus[company.employer_no].epf_collected_day;
      const newEpfPaidDay = paymentStatus[company.employer_no].epf_paid_day;
      const newEtfCollectedDay =
        paymentStatus[company.employer_no].etf_collected_day;
      const newEtfPaidDay = paymentStatus[company.employer_no].etf_paid_day;

      // Check if payment details need to be updated
      const updates = [];
      if (newEpfChequeNo && payment.epf_cheque_no !== newEpfChequeNo) {
        payment.epf_cheque_no = newEpfChequeNo;
        updates.push(`EPF Cheque No: ${newEpfChequeNo}`);
      }
      if (newEtfChequeNo && payment.etf_cheque_no !== newEtfChequeNo) {
        payment.etf_cheque_no = newEtfChequeNo;
        updates.push(`ETF Cheque No: ${newEtfChequeNo}`);
      }
      if (payment.epf_collected_day !== newEpfCollectedDay) {
        payment.epf_collected_day = newEpfCollectedDay;
        updates.push(`Collected day (EPF): ${newEpfCollectedDay}`);
      }
      if (payment.epf_paid_day !== newEpfPaidDay) {
        payment.epf_paid_day = newEpfPaidDay;
        updates.push(`Paid day (EPF): ${newEpfPaidDay}`);
      }
      if (payment.etf_collected_day !== newEtfCollectedDay) {
        payment.etf_collected_day = newEtfCollectedDay;
        updates.push(`Collected day (ETF): ${newEtfCollectedDay}`);
      }
      if (payment.etf_paid_day !== newEtfPaidDay) {
        payment.etf_paid_day = newEtfPaidDay;
        updates.push(`Paid day (ETF): ${newEtfPaidDay}`);
      }

      if (updates.length > 0) {
        const alertMsg = `Payment updated for ${
          company.name
        } - ${period}\n${updates.join("\n")}`;
        alert(alertMsg);

        // Update updatedMonthlyPayments
        setUpdatedMonthlyPayments((prev) => ({
          ...prev,
          [company.employer_no]: {
            ...prev[company.employer_no],
            [period]: payment,
          },
        }));

        // Add monthly details to updatedMonthlyDetails
        if (!updatedMonthlyDetails[company.employer_no]) {
          updatedMonthlyDetails[company.employer_no] = {};
        }

        for (const employee of company.employees) {
          if (!updatedMonthlyDetails[company.employer_no][employee.epf_no]) {
            updatedMonthlyDetails[company.employer_no][employee.epf_no] = [];
          }

          if (
            updatedMonthlyDetails[company.employer_no][employee.epf_no].find(
              (md) => md.period === period
            )
          ) {
            continue;
          }

          const monthlyDetail = employee.monthly_details.find(
            (md) => md.period === period
          );

          if (monthlyDetail) {
            const val = {
              ...monthlyDetail,
              epf_no: employee.epf_no,
              employer_no: company.employer_no,
              company_name: company.name,
              employee_name: employee.name,
            };

            updatedMonthlyDetails[company.employer_no][employee.epf_no].push(
              val
            );
          }
        }

        setUpdatedMonthlyDetails({ ...updatedMonthlyDetails });
      } else {
        alert("No changes to make for " + company.name + " - " + period);
      }
      return;
    }
    const pd = await generate_payment_detail(
      company,
      period,
      monthlyPaymentFields,
      paymentStatus[company.employer_no].epf_collected_day,
      paymentStatus[company.employer_no].epf_paid_day,
      paymentStatus[company.employer_no].etf_collected_day,
      paymentStatus[company.employer_no].etf_paid_day,
      paymentStatus[company.employer_no].epf_cheque_no ||
        company.monthly_payments.find((p) => p.period === period)
          ?.epf_cheque_no ||
        "",
      paymentStatus[company.employer_no].etf_cheque_no ||
        company.monthly_payments.find((p) => p.period === period)
          ?.etf_cheque_no ||
        ""
    );
    if (!pd) return;
    if (pd.epf_amount == 0) return;

    // Update state for updatedMonthlyPayments
    setUpdatedMonthlyPayments((prev) => ({
      ...prev,
      [company.employer_no]: {
        ...prev[company.employer_no],
        [period]: pd,
      },
    }));

    company.monthly_payments.push(pd);
  };

  const payment_gen_companies = async (companies, monthlyStatus) => {
    await Promise.all(
      companies.map(async (company) => {
        if (monthlyStatus[company.employer_no].include) {
          await payment_gen_company(
            company,
            monthlyStatus[company.employer_no].period
          );
        }
      })
    );
    alert("Monthly Payments generated for all companies.");
  };

  const monthly_gen_company = (
    company,
    period,
    monthly_details_given = null
  ) => {
    if (monthly_details_given !== null) {
      if (!updatedMonthlyDetails[company.employer_no]) {
        updatedMonthlyDetails[company.employer_no] = {};
      }
      for (const [epf_no, details] of Object.entries(monthly_details_given)) {
        const employee = updatedMonthlyDetails[company.employer_no][epf_no];
        if (employee) {
          const d = details.find((d) => d.period == period);
          const d_updated = employee.find((d) => d.period == period);
          if (d && !d_updated) {
            updatedMonthlyDetails[company.employer_no][epf_no].push(d);
          }
        } else {
          updatedMonthlyDetails[company.employer_no][epf_no] = [];
          const d = details.find((d) => d.period == period);
          updatedMonthlyDetails[company.employer_no][epf_no].push(d);
        }
      }
      return;
    }
    const monthly_details = generate_monthly_details(company, period);
    for (const [key, value] of Object.entries(monthly_details)) {
      const employee = company.employees.find((e) => e.epf_no == key);
      if (employee) {
        employee.monthly_details.push(value);
        //add the employer_no if not in updatedComapnies
        const val = Object.keys(value).reduce((obj, key) => {
          obj[key] = value[key];
          obj["epf_no"] = employee.epf_no;
          obj["employer_no"] = company.employer_no;
          obj["company_name"] = company.name;
          obj["employee_name"] = employee.name;
          return obj;
        }, {});
        if (!updatedMonthlyDetails[company.employer_no]) {
          // If it's undefined, initialize it as an empty array
          updatedMonthlyDetails[company.employer_no] = {};
        }
        if (!updatedMonthlyDetails[company.employer_no][employee.epf_no]) {
          // If it's undefined, initialize it as an empty array
          updatedMonthlyDetails[company.employer_no][employee.epf_no] = [];
        }
        updatedMonthlyDetails[company.employer_no][employee.epf_no].push(val);
      }
    }
    setUpdatedMonthlyDetails((prev) => ({ ...prev }));
    //console.log(updatedMonthlyDetails);
  };

  const monthly_gen_companies = (companies, monthlyStatus) => {
    console.log(monthlyStatus);
    companies.forEach((company) => {
      if (monthlyStatus[company.employer_no].include) {
        monthly_gen_company(company, monthlyStatus[company.employer_no].period);
      }
    });
    alert("Monthly details generated for all companies.");
  };

  const deleteCompany = async (employer_no) => {
    try {
      const resDel = await axios.post(
        process.env.REACT_APP_SERVER_URL + "/delete-company",
        { params: { employer_no: employer_no } }
      );
      console.log(resDel.data, employer_no);
      setCompanies(companies.filter((c) => c.employer_no !== employer_no));
    } catch (err) {
      alert(`An error occurred while deleting the company: \n${err}`);
    }
  };

  const PaymentDetailsTable = ({ company, payment }) => {
    if (!company) return null;
    if (!payment) return null;

    return (
      <div className="payment-details">
        <div className="h6 card-header">{"Payment Details"}</div>
        <table className="card-body table table-hover">
          <thead>
            <tr>
              {Object.keys(payment).map((key) => {
                switch (key) {
                  case "_id":
                  case "__v":
                  case "period":
                  //case "epf_payment_method":
                  //case "etf_payment_method":
                  case "my_payment":
                    return null;
                  case "epf_collected_day":
                  case "etf_collected_day":
                  case "epf_paid_day":
                  case "etf_paid_day":
                    if (visibleColumns.includes(key)) {
                      return (
                        <th key={company.name + "-" + key + "head"}>
                          <TableKey key_name={key} />
                        </th>
                      );
                    }
                    break;

                  case "epf_cheque_no":
                    return company[
                      "default_epf_payment_method"
                    ].toLowerCase() === "cash" ? null : (
                      <th key={company.name + "-" + key + "head"}>
                        <TableKey key_name={key} />
                      </th>
                    );
                  case "etf_cheque_no":
                    return company[
                      "default_etf_payment_method"
                    ].toLowerCase() === "cash" ? null : (
                      <th key={company.name + "-" + key + "head"}>
                        <TableKey key_name={key} />
                      </th>
                    );

                  default:
                    return (
                      <th key={company.name + "-" + key + "head"}>
                        <TableKey key_name={key} />
                      </th>
                    );
                }
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.entries(payment).map(([key, value]) => {
                let v = value;
                switch (key) {
                  case "_id":
                  case "__v":
                  case "period":
                  //case "epf_payment_method":
                  //case "etf_payment_method":
                  case "my_payment":
                    return null;
                  case "epf_collected_day":
                  case "etf_collected_day":
                  case "epf_paid_day":
                  case "etf_paid_day":
                    if (visibleColumns.includes(key)) {
                      return (
                        <td key={company.name + "-" + key + "-value"}>{v}</td>
                      );
                    }
                    break;
                  case "epf_cheque_no":
                    return company[
                      "default_epf_payment_method"
                    ].toLowerCase() === "cash" ? null : (
                      <td key={company.name + "-" + key + "-value"}>{v}</td>
                    );
                  case "etf_cheque_no":
                    return company[
                      "default_etf_payment_method"
                    ].toLowerCase() === "cash" ? null : (
                      <td key={company.name + "-" + key + "-value"}>{v}</td>
                    );

                  case "epf_amount":
                  case "etf_amount":
                  case "month_salary":
                    return (
                      <td key={company.name + "-" + key + "-value"}>
                        {v.toFixed(2)}
                      </td>
                    );
                  default:
                    return (
                      <td key={company.name + "-" + key + "-value"}>{v}</td>
                    );
                }
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const MonthlyDetails = ({ monthlyDetails, companies, monthly_payments }) => {
    return (
      <div>
        {Object.entries(monthlyDetails).map(([employer_no, employees]) => {
          const allEmployeeDetails = Object.values(employees).flatMap(
            (details) => details
          );
          //if length of each employee details is 0, return null
          if (allEmployeeDetails.length === 0) return null;

          const detailsByPeriod = {};
          allEmployeeDetails.forEach((detail) => {
            if (!detailsByPeriod[detail.period]) {
              detailsByPeriod[detail.period] = [];
            }
            //console.log(detail);
            detailsByPeriod[detail.period].push(detail);
          });

          return (
            <div key={`company-${employer_no}`} className="card p-1 mt-4 mb-4">
              <div className="h5 mt-4 m-2 text-primary card-header">
                {companies.find((c) => c.employer_no === employer_no)?.name +
                  " - " +
                  employer_no}
              </div>
              {/* Render table for each period */}
              {Object.entries(detailsByPeriod).map(
                ([period, periodDetails]) => (
                  <div
                    className="card p-2 m-2 text-secondary"
                    key={`period-${period}`}
                  >
                    <div className="">
                      <div className="h6 card-header">{period}</div>
                      <table
                        className="card-body table table-hover"
                        style={{ overflowY: "auto", maxHeight: "500px" }}
                      >
                        <thead>
                          <tr>
                            {Object.keys(periodDetails[0]).map(
                              (key) =>
                                key !== "period" && (
                                  <th key={key}>
                                    {(() => {
                                      switch (key) {
                                        case "_id":
                                        case "company_name":
                                        case "employer_no":
                                        case "deductions":
                                        case "deductions_y":
                                          return;

                                        case "employee_name":
                                          return <TableKey key_name={"Name"} />;
                                        // Add more cases as needed
                                        default:
                                          return <TableKey key_name={key} />;
                                      }
                                    })()}
                                  </th>
                                )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {periodDetails.map((detail, index) => (
                            <tr key={`detail-${index}`}>
                              {Object.entries(detail).map(
                                ([key, value]) =>
                                  key !== "period" && (
                                    <td key={`${key}-${value}`}>
                                      {(() => {
                                        switch (key) {
                                          case "_id":
                                          case "company_name":
                                          case "employer_no":
                                          case "deductions":
                                          case "deductions_y":
                                            return /* Custom logic to format value */;
                                          // Add more cases as needed
                                          default:
                                            return value;
                                        }
                                      })()}
                                    </td>
                                  )
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {monthly_payments[employer_no] &&
                        monthly_payments[employer_no][period] && (
                          <PaymentDetailsTable
                            company={companies.find(
                              (c) => c.employer_no === employer_no
                            )}
                            payment={monthly_payments[employer_no][period]}
                          />
                        )}
                    </div>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {companies.length === 0 ? (
        <div className="h4">No companies found.</div>
      ) : (
        <div>
          <p className="h5">Select columns to display:</p>
          <div className="d-flex flex-wrap">
            {fields.map((field) => {
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
                        <CheckBoxInput
                          key_name={"show_field-" + field}
                          value={!default_hidden_columns.includes(field)}
                          handleChangeFunction={handleChange}
                        />
                      </div>
                    </div>
                  );
              }
            })}
          </div>
          <input
            type="text"
            className="form-control mb-3"
            id="search-input"
            placeholder="Search..."
            onChange={handleChange}
          ></input>

          <div className="row align-items-center mb-2">
            <div className="col-auto">
              <div className="h6 me-2">Change period :</div>
              <MonthInput
                key_name={"monthly-period-all"}
                value={previousYearMonth}
                handleChangeFunction={handleChange}
                disabled={
                  !visibleColumns.includes("monthly_gen_period") ||
                  paymentProcessingState
                }
              />
            </div>

            {visibleColumns.includes("epf_collected_day") && (
              <div className="col-auto">
                <div className="h6 me-2">Change EPF Collected Day :</div>
                <DateInput
                  key_name={"epf_collected_day-all"}
                  value={previousYearMonth}
                  handleChangeFunction={handleChange}
                  disabled={
                    !visibleColumns.includes("epf_collected_day") ||
                    paymentProcessingState
                  }
                />
              </div>
            )}

            {visibleColumns.includes("etf_collected_day") && (
              <div className="col-auto">
                <div className="h6 me-2">Change ETF Collected Day :</div>
                <DateInput
                  key_name={"etf_collected_day-all"}
                  value={previousYearMonth}
                  handleChangeFunction={handleChange}
                  disabled={
                    !visibleColumns.includes("etf_collected_day") ||
                    paymentProcessingState
                  }
                />
              </div>
            )}

            {visibleColumns.includes("epf_paid_day") && (
              <div className="col-auto">
                <div className="h6 me-2">Change EPF Paid Day :</div>
                <DateInput
                  key_name={"epf_paid_day-all"}
                  value={previousYearMonth}
                  handleChangeFunction={handleChange}
                  disabled={
                    !visibleColumns.includes("epf_paid_day") ||
                    paymentProcessingState
                  }
                />
              </div>
            )}

            {visibleColumns.includes("etf_paid_day") && (
              <div className="col-auto">
                <div className="h6 me-2">Change ETF Paid Day :</div>
                <DateInput
                  key_name={"etf_paid_day-all"}
                  value={previousYearMonth}
                  handleChangeFunction={handleChange}
                  disabled={
                    !visibleColumns.includes("etf_paid_day") ||
                    paymentProcessingState
                  }
                />
              </div>
            )}
          </div>

          <div
            className="mt-2"
            style={{ overflowY: "auto", maxHeight: "500px" }}
          >
            <table className="table table-responsive table-hover">
              <thead>
                <tr>
                  {fields.map((field) => {
                    if (visibleColumns.includes(field)) {
                      {
                        switch (field) {
                          case "monthly_gen":
                            return (
                              <th key={field + "title"}>
                                <TableKey key_name={field} />
                                <button
                                  id={"monthly-gen-all"}
                                  className="btn btn-outline-success text-left m-1"
                                  onClick={handleClick}
                                  disabled={paymentProcessingState}
                                >
                                  Gen all
                                </button>
                              </th>
                            );
                          case "payment_gen":
                            return (
                              <th key={field + "title"}>
                                <TableKey key_name={field} />
                                <button
                                  id={"payment-gen-all"}
                                  className="btn btn-outline-success text-left m-1"
                                  onClick={handleClick}
                                  disabled={paymentProcessingState}
                                >
                                  Gen all
                                </button>
                              </th>
                            );

                          default:
                            return (
                              <th key={field + "title"}>
                                <TableKey key_name={field} />
                              </th>
                            );
                        }
                      }
                    }
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredCompanies ? (
                  filteredCompanies.map((company) => {
                    return (
                      <tr key={company.employer_no}>
                        {fields.map((field) => {
                          if (visibleColumns.includes(field)) {
                            switch (field) {
                              case "active":
                                return (
                                  <td key={company.employer_no + field}>
                                    <div className="form-check form-switch">
                                      <CheckBoxInput
                                        key_name={
                                          company.employer_no + "_" + field
                                        }
                                        value={company.active}
                                        readOnly={true}
                                      />
                                    </div>
                                  </td>
                                );

                              case "monthly_include":
                                return (
                                  <td key={company.employer_no + field}>
                                    <div className="form-check form-switch">
                                      <CheckBoxInput
                                        key_name={
                                          "monthly-include-" +
                                          company.employer_no
                                        }
                                        value={company.active}
                                        handleChangeFunction={handleChange}
                                        disabled={paymentProcessingState}
                                      />
                                    </div>
                                  </td>
                                );

                              case "epf_cheque_no":
                              case "etf_cheque_no":
                                return (
                                  <td key={company.employer_no + field}>
                                    <TextInput
                                      key_name={
                                        field + "-" + company.employer_no
                                      }
                                      value={
                                        company.monthly_payments.find(
                                          (p) =>
                                            p.period ==
                                            paymentStatus[company.employer_no]
                                              .period
                                        )
                                          ? company.monthly_payments.find(
                                              (p) =>
                                                p.period ==
                                                paymentStatus[
                                                  company.employer_no
                                                ].period
                                            )[field]
                                          : ""
                                      }
                                      handleChangeFunction={handleChange}
                                      disabled={paymentProcessingState}
                                    />
                                  </td>
                                );

                              case "epf_collected_day":
                              case "etf_collected_day":
                              case "epf_paid_day":
                              case "etf_paid_day":
                                return (
                                  <td key={company.employer_no + field}>
                                    <DateInput
                                      key_name={
                                        field + "-" + company.employer_no
                                      }
                                      value={nextDay}
                                      handleChangeFunction={handleChange}
                                      disabled={paymentProcessingState}
                                    />
                                  </td>
                                );

                              case "monthly_gen_period":
                                return (
                                  <td key={company.employer_no + field}>
                                    <MonthInput
                                      key_name={
                                        "monthly-period-" + company.employer_no
                                      }
                                      value={previousYearMonth}
                                      handleChangeFunction={handleChange}
                                      disabled={paymentProcessingState}
                                    />
                                  </td>
                                );

                              case "monthly_gen":
                                return (
                                  <td key={company.employer_no + field}>
                                    <button
                                      id={"monthly-gen-" + company.employer_no}
                                      className="btn btn-outline-dark text-left m-1"
                                      onClick={handleClick}
                                      disabled={paymentProcessingState}
                                    >
                                      Gen
                                    </button>
                                    <Link
                                      to={
                                        "./" +
                                        company.employer_no.replace("/", "-") +
                                        "/generate-monthly"
                                      }
                                    >
                                      <button
                                        className="btn btn-outline-dark text-left m-1"
                                        disabled={paymentProcessingState}
                                      >
                                        Go
                                      </button>
                                    </Link>
                                  </td>
                                );

                              case "payment_gen":
                                return (
                                  <td key={company.employer_no + field}>
                                    <button
                                      id={"payment-gen-" + company.employer_no}
                                      className="btn btn-outline-dark text-left m-1"
                                      onClick={handleClick}
                                      disabled={paymentProcessingState}
                                    >
                                      Gen
                                    </button>
                                  </td>
                                );

                              case "manage":
                                return (
                                  <td key={company.employer_no + field}>
                                    <Link
                                      to={
                                        "./" +
                                        company.employer_no.replace("/", "-")
                                      }
                                    >
                                      <button className="btn btn-outline-primary text-left m-1">
                                        View
                                      </button>
                                    </Link>
                                    <button
                                      className="btn btn-outline-danger text-left m-1"
                                      id={
                                        "delete-company-btn-" +
                                        company.employer_no
                                      }
                                      onClick={handleClick}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                );

                              case "active_employees":
                                return (
                                  <td key={company.employer_no + field}>
                                    {company["active_employees_count"]}
                                  </td>
                                );
                              default:
                                return (
                                  <td key={company.employer_no + field}>
                                    {company[field]}
                                  </td>
                                );
                            }
                          }
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <div>
              <div className="form-check form-switch">
                {" Show generated details"}
                <CheckBoxInput
                  key_name={"show-generated"}
                  value={showGeneratedDetails}
                  handleChangeFunction={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="form-check form-switch">
                {" Show selected details"}
                <CheckBoxInput
                  key_name={"show-selected"}
                  value={showSelectedDetails}
                  handleChangeFunction={handleChange}
                />
              </div>
            </div>
          </div>

          {showGeneratedDetails &&
            Object.keys(updatedMonthlyDetails).length > 0 && (
              <div className="d-flex align-items-center">
                <h4 className="me-3 ">Generated Monthly Details:</h4>
                <button
                  id="save-companies-btn"
                  className="btn btn-success mb-3"
                  onClick={handleClick}
                >
                  Save
                </button>
              </div>
            )}

          {showGeneratedDetails && (
            <div>
              <MonthlyDetails
                className="mt-5 mb-5"
                monthlyDetails={updatedMonthlyDetails}
                companies={companies}
                monthly_payments={updatedMonthlyPayments}
              />
            </div>
          )}

          <hr className="my-5" />

          {showSelectedDetails && Object.keys(monthlyDetails).length > 0 && (
            <div className="d-flex align-items-center">
              <h4 className="me-3 ">Monthly Details of selected periods:</h4>
              <button
                id="delete-monthly-btn"
                className="btn btn-danger mb-3"
                onClick={handleClick}
              >
                Delete
              </button>
            </div>
          )}
          {showSelectedDetails && (
            <div>
              <MonthlyDetails
                className="mt-5 mb-5"
                monthlyDetails={monthlyDetails}
                companies={companies}
                monthly_payments={monthlyPayments}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompaniesTable;
