function TextInput({
  key_name,
  value,
  handleChangeFunction,
  disabled = false,
}) {
  return (
    <input
      className="form-control text-dark ms-2 me-2"
      type="textarea"
      id={key_name}
      onChange={handleChangeFunction}
      defaultValue={value ? value : ""}
      disabled={disabled}
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
}) => {
  return (
    <select
      id={keyName}
      defaultValue={value ? value : optionKeys[0]}
      onChange={handleChangeFunction}
      disabled={disabled}
      className="form-select ms-2 me-2"
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
      className="ms-2 me-2 form-check-input"
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
      className="form-control ms-2 me-2"
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
      className="form-control ms-2 me-2"
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
      />
      <div className="input-group-append">
        <button
          name="setbutton-cash"
          className="btn btn-outline-dark me-2"
          type="button"
          onClick={(e) => setPaymentMethod("CASH")}
          disabled={disabled}
        >
          Cash
        </button>
      </div>
      <div className="input-group-append">
        <button
          className="btn btn-outline-dark"
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
  return (
    <div className="text-start">
      {key_name.toUpperCase().replace(/_/g, " ")}
    </div>
  );
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

export {
  TextInput,
  CheckBoxInput,
  TableKey,
  TableKeyWithResetBtn,
  DateInput,
  MonthInput,
  PaymentMethodInput,
  DropdownInput,
};
