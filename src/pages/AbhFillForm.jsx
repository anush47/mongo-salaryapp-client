import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import axios from "axios";

import Header from "../Components/Header";
import {
  TextInput,
  DropdownInput,
  DateInput,
} from "../Components/InputComponents";

const abhLabels = {
  fullName: "Full Name 👤",
  otherNames: "Other Names 📇",
  employerNo: "Employer Number 🔢",
  epfNo: "EPF Number 📄",
  address: "Address 🏠",
  nationality: "Nationality 🌍",
  nic: "NIC 🆔",
  placeOfBirth: "Place of Birth 🌍",
  marriedOrSingle: "Married or Single 💍",
  spouseName: "Spouse Name (Husband/Wife) 👩‍❤️‍👨",
  fatherName: "Father's Name 👴",
  fatherBirthPlace: "Father's Birthplace 🏠",
  motherName: "Mother's Name 👵",
  fatherFatherName: "Paternal Grandfather's Name (Father's Side) 👴",
  fatherFatherBirthPlace:
    "Paternal Grandfather's Birthplace (Father's Side) 🏠",
  motherFatherName: "Maternal Grandfather's Name (Mother's Side) 👵",
  motherFatherBirthPlace:
    "Maternal Grandfather's Birthplace (Mother's Side) 🏠",
  lastEmployerName: "Last Employer's Name 🏢",
  lastEmployerAddress: "Last Employer's Address 🏢",
  lastEmployment: "Last Employment 📅",
  lastEmploymentPeriod: "Last Employment Period 📅",
  nominations: "Nominations 📜",
  employer: "Employer 🏢",
  employerAddress: "Employer's Address 🏢",
  employment: "Employment 📅",
  employedDate: "Employed Date 📅",
  grossSalary: "Gross Salary 💰",
  date: "Date 📅",
  witnessName: "Witness Name 👥",
  witnessPosition: "Witness Position 👤",
  witnessAddress: "Witness Address 🏠",
};

const TableKey = ({ key_name }) => {
  return (
    <td scope="col" style={{ width: "30vw" }} className="h6 text-end">
      {`${abhLabels[key_name].toUpperCase()} : `}
    </td>
  );
};

const AbhFillForm = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading completion after initial render
    setIsLoading(false);
  }, []);

  var { employer_no, epf_no } = useParams();
  // format employer_no
  employer_no = employer_no.replace(/-/g, "/");

  const [company, setCompany] = useState({});
  const [employee, setEmployee] = useState({});

  const [paymentProcessingState, setPaymentProcessingState] = useState(false);

  const defaultHeight = "1rem";

  const [abhData, setAbhData] = useState({
    fullName: "",
    otherNames: "",
    employerNo: "",
    epfNo: "",
    address: "",
    nationality: "",
    nic: "",
    placeOfBirth: "",
    marriedOrSingle: "",
    spouseName: "",
    fatherName: "",
    fatherBirthPlace: "",
    motherName: "",
    fatherFatherName: "",
    fatherFatherBirthPlace: "",
    motherFatherName: "",
    motherFatherBirthPlace: "",
    lastEmployerName: "",
    lastEmployerAddress: "",
    lastEmployment: "",
    lastEmploymentPeriod: "",
    nominations: [
      {
        name: "",
        nic: "",
        relationship: "",
        share: "",
      },
      {
        name: "",
        nic: "",
        relationship: "",
        share: "",
      },
      {
        name: "",
        nic: "",
        relationship: "",
        share: "",
      },
      {
        name: "",
        nic: "",
        relationship: "",
        share: "",
      },
      {
        name: "",
        nic: "",
        relationship: "",
        share: "",
      },
    ],
    employer: "",
    employerAddress: "",
    employment: "",
    employedDate: "",
    grossSalary: "",
    date: "",
    witnessName: "",
    witnessPosition: "",
    witnessAddress: "",
  });

  useEffect(() => {
    const fetchCompanyEmployee = async (employer_no, epf_no) => {
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
        if (!companyData.monthly_payments) {
          companyData.monthly_payments = [];
        }

        setCompany(companyData);
        const emp = companyData.employees.find(
          (employee) => employee.epf_no == epf_no
        );
        if (emp) {
          // setEmployee else throw error
          setEmployee(emp);
          setAbhData({
            ...abhData,
            fullName: emp.name.toUpperCase(),
            employerNo: companyData.employer_no,
            epfNo: emp.epf_no,
            marriedOrSingle: "MARRIED",
            grossSalary: emp.gross_salary.toFixed(2),
            employer: companyData.name.toUpperCase(),
            employerAddress: companyData.address.toUpperCase(),
            nic: emp.nic.toUpperCase(),
            nationality: "SINHALA",
            //date as 2024/02/02
            date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          });
        } else {
          throw new Error("Employee not found");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompanyEmployee(employer_no, epf_no);
  }, [employer_no]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id.startsWith("nomination")) {
      const [key, subkey, index] = id.split("_");
      console.log(index);
      abhData["nominations"][index][subkey] = value.toUpperCase();
      return;
    }
    abhData[id] = value.toUpperCase();
  };

  const downloadABH = async (data) => {
    setPaymentProcessingState(true);
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVER_URL + "/generate-abh",
        { data },
        { responseType: "arraybuffer" } // Specify response type
      );

      const filename = `${abhData.employerNo}_${abhData.epfNo}_ABH.pdf`;
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
    } catch (error) {
      console.error("Error downloading ABH PDF:", error);
    } finally {
      setPaymentProcessingState(false);
    }
  };

  const handleClick = (e) => {
    if (e.target.id === "submit") {
      setAbhData({ ...abhData });
      console.log(abhData);
      downloadABH(abhData);
    }
  };

  const TextRow = ({ key_name }) => {
    return (
      <tr key={key_name}>
        <TableKey key_name={key_name} />
        <td>
          <TextInput
            key_name={key_name}
            handleChangeFunction={handleChange}
            value={abhData[key_name]}
            height={
              key_name === "lastEmployerAddress" ||
              key_name === "witnessAddress" ||
              key_name === "address" ||
              key_name === "employerAddress"
                ? undefined
                : defaultHeight
            }
          />
        </td>
      </tr>
    );
  };

  const DateRow = ({ key_name }) => {
    return (
      <tr key={key_name}>
        <TableKey key_name={key_name} />
        <td>
          <DateInput
            key_name={key_name}
            handleChangeFunction={handleChange}
            value={abhData[key_name]}
          />
        </td>
      </tr>
    );
  };

  const NominationTable = () => {
    return (
      <table className="table table-responsive table-bordered table-hover">
        <thead className="">
          <tr>
            <th scope="col">NAME</th>
            <th scope="col">NIC</th>
            <th scope="col">RELATIONSHIP</th>
            <th scope="col">SHARE</th>
          </tr>
        </thead>
        <tbody>
          {abhData.nominations.map((nomination, index) => {
            return (
              <tr key={index}>
                <td>
                  <TextInput
                    key_name={`nomination_name_${index}`}
                    handleChangeFunction={handleChange}
                    value={nomination.name}
                    height={defaultHeight}
                  />
                </td>
                <td>
                  <TextInput
                    key_name={`nomination_nic_${index}`}
                    handleChangeFunction={handleChange}
                    value={nomination.relationship}
                    height={defaultHeight}
                  />
                </td>
                <td>
                  <TextInput
                    key_name={`nomination_relationship_${index}`}
                    handleChangeFunction={handleChange}
                    value={nomination.relationship}
                    height={defaultHeight}
                  />
                </td>
                <td>
                  <TextInput
                    key_name={`nomination_share_${index}`}
                    handleChangeFunction={handleChange}
                    value={nomination.share}
                    height={defaultHeight}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container mt-5">
      <div
        className={`mt-3 fade ${isLoading ? "fade-out" : "fade-in"}`}
        style={{
          transition: "opacity 0.25s ease-in-out",
          opacity: isLoading ? 0 : 1,
        }}
      >
        {paymentProcessingState && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center"
            style={{ zIndex: 1000 }}
          >
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="ms-3 text-light">Processing...</p>
          </div>
        )}
        <Header title={`ABH Form - ${employee.name} - ${company.name}`} />
        <div className="container">
          <hr className="my-3" />
          <div className="h3 text-center m-2">DETAILS</div>
          <hr className="my-3" />
          <table className="table table-hover table-responsive">
            <tbody>
              {Object.keys(abhData).map((key) => {
                switch (key) {
                  case "marriedOrSingle":
                    return (
                      <tr key={key}>
                        <TableKey key_name={key} />
                        <td>
                          <DropdownInput
                            keyName={key}
                            value={abhData[key]}
                            handleChangeFunction={handleChange}
                            optionKeys={["MARRIED", "SINGLE"]}
                            optionVals={["MARRIED", "SINGLE"]}
                            height={defaultHeight}
                          />
                        </td>
                      </tr>
                    );

                  case "nominations":
                    return null;

                  case "date":
                  case "employedDate":
                    return <DateRow key={key} key_name={key} />;

                  default:
                    return <TextRow key={key + "hee"} key_name={key} />;
                }
              })}
            </tbody>
          </table>

          <hr className="my-3" />
          <div className="h3 text-center m-3">NOMINATIONS</div>
          <hr className="my-3" />
          <div className="container">
            <NominationTable />
          </div>

          <hr className="my-3" />
          <div className="h3 text-center m-3">GENERATE PDF</div>
          <hr className="my-3" />

          <div className="container text-center">
            <button
              id="submit"
              className="btn btn-success btn-lg shadow"
              onClick={handleClick}
            >
              GET ABH
            </button>

            <hr className="my-5" />
            <div className="h6 text-center m-3">
              &copy; All Rights Reserved.
            </div>
            <hr className="my-3" />
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbhFillForm;
