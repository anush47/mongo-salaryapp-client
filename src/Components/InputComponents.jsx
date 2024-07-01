import React, { useState } from "react";
const default_text_width = "100%";

function TextInput({
  key_name,
  value,
  handleChangeFunction,
  disabled = false,
  resizable = "both",
  width,
  height,
}) {
  const default_text_height = "1rem auto";
  return (
    <textarea
      className="form-control text-dark shadow"
      id={key_name}
      onChange={handleChangeFunction}
      defaultValue={value ? value : ""}
      disabled={disabled}
      style={{
        height: height ? height : default_text_height,
        resize: resizable,
        width: width ? width : default_text_width,
      }}
    />
  );
}

function MinWidthSetTextArea({ width }) {
  return (
    <textarea
      style={{
        display: "flex",
        resize: "none",
        height: "0rem",
        width: width ? width : default_text_width,
        opacity: 0,
      }}
    />
  );
}

const DropdownInput = ({
  keyName,
  value,
  optionKeys,
  optionVals,
  handleChangeFunction,
  disabled,
  width,
}) => {
  const default_dropdow_width = "100%";
  return (
    <select
      id={keyName}
      defaultValue={value ? value : optionKeys[0]}
      onChange={handleChangeFunction}
      disabled={disabled}
      className="form-select m-1 shadow"
      style={{
        width: width ? width : default_dropdow_width,
      }}
    >
      {optionVals.map((optionVal, i) => (
        <option
          className="dropdown-item"
          key={optionKeys[i]}
          value={optionKeys[i]}
        >
          {optionVal}
        </option>
      ))}
    </select>
  );
};

function CheckBoxInput({
  key_name,
  value,
  handleChangeFunction,
  readOnly = false,
  disabled = false,
}) {
  return (
    <input
      className="form-check-input shadow"
      type="checkbox"
      id={key_name}
      onChange={handleChangeFunction}
      defaultChecked={value != null ? value : true}
      disabled={readOnly || disabled}
      style={{}}
    />
  );
}

function DateInput({
  key_name,
  value,
  handleChangeFunction,
  disabled = false,
}) {
  return (
    <input
      className="form-control m-1 shadow"
      type="date"
      id={key_name}
      onChange={handleChangeFunction}
      defaultValue={value ? value.split("T")[0] : ""}
      style={{ width: "150px" }}
      disabled={disabled}
    />
  );
}

function MonthInput({
  key_name,
  value,
  handleChangeFunction,
  disabled = false,
}) {
  const defaultValue = value ? value.split("-").slice(0, 2).join("-") : "";
  return (
    <input
      className="form-control ms-2 me-2 shadow"
      type="month"
      id={key_name}
      onChange={handleChangeFunction}
      defaultValue={defaultValue}
      style={{ width: "165px" }}
      disabled={disabled}
    />
  );
}

function PaymentMethodInput({
  key_name,
  value,
  handleChangeFunction,
  handleChangeElementFunction,
  disabled = false,
  height,
}) {
  const setPaymentMethod = (str) => {
    const e = document.getElementById(key_name);
    e.value = str;
    handleChangeElementFunction(e);
  };
  return (
    <div className="input-group">
      <TextInput
        key_name={key_name}
        value={value}
        handleChangeFunction={handleChangeFunction}
        disabled={disabled}
        resizable={"block"}
        width={"10rem"}
        height={height}
      />
      <div className="input-group-append">
        <button
          name="setbutton-cash"
          className="btn btn-outline-dark m-1 shadow"
          type="button"
          onClick={(e) => setPaymentMethod("Cash")}
          disabled={disabled}
        >
          Cash
        </button>
      </div>
      <div className="input-group-append">
        <button
          className="btn btn-outline-dark m-1 shadow"
          type="button"
          onClick={(e) => setPaymentMethod("")}
          disabled={disabled}
        >
          None
        </button>
      </div>
    </div>
  );
}

function TableKey({ key_name }) {
  // Split the key_name by underscores and capitalize each word
  const formattedKey = key_name.split("_").join(" ").toUpperCase();

  return <div className="text-start">{formattedKey}</div>;
}

function TableKeyWithResetBtn({ key_name, resetFuction }) {
  return (
    <div className="text-start">
      <b>{key_name.toUpperCase().replace(/_/g, " ")}</b>
      <button
        id={key_name + "-reset"}
        className={"d-none"}
        onClick={(e) => resetFuction(key_name)}
      >
        Reset
      </button>
    </div>
  );
}
function FileInput() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUrlChange = (event) => {
    const enteredUrl = event.target.value;
    setUrl(enteredUrl);
  };

  const handleSubmit = () => {
    if (file) {
      // Handle file upload
      console.log("File:", file);
    } else if (url.trim() !== "") {
      // Handle URL input
      console.log("URL:", url);
    } else {
      alert("Please select a file or enter a URL.");
      return;
    }
    // Close the modal after submission
    setModalOpen(false);
  };

  return (
    <div>
      <button style={{ margin: "10px" }} onClick={() => setModalOpen(true)}>
        Open Modal
      </button>
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2>Upload a File or Enter a URL</h2>
            <div className="form-group">
              <input
                type="file"
                className="form-control-file"
                onChange={handleFileChange}
                accept=".js"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                onChange={handleUrlChange}
                placeholder="Enter URL"
              />
            </div>
            <button style={{ marginRight: "5px" }} onClick={handleSubmit}>
              Submit
            </button>
            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export {
  TextInput,
  CheckBoxInput,
  TableKey,
  TableKeyWithResetBtn,
  DateInput,
  MonthInput,
  PaymentMethodInput,
  DropdownInput,
  MinWidthSetTextArea,
  FileInput,
};
