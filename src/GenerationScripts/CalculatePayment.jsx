import axios from "axios";
const get_ref_no = async (company, period) => {
  const employer_no = company.employer_no;
  //console.log(employer_no, period);
  try {
    let response = await axios.get(
      process.env.REACT_APP_SERVER_URL + "/get-reference-no",
      { params: { employer_no: employer_no, period: period } }
    );
    // check if the returned reference number
    if (!isNaN(parseInt(response.data))) {
      return response.data;
    } else {
      alert(
        `Failed to get the reference number of ${company.employer_no} - ${company.name} for ${period}`
      );
      console.log(response);
    }
  } catch (err) {
    console.log("Error in getting reference number : ", err);
  }
  return null;
};

const calculate_epf_etf_payment = (period, company) => {
  let epf_amount = 0;
  let etf_amount = 0;
  let no_monthly = [];
  company.employees.forEach((employee) => {
    //if period not available alert
    if (
      employee.monthly_details &&
      employee.monthly_details.find((x) => x.period == period)
    ) {
      employee.monthly_details.forEach((monthly_detail) => {
        if (monthly_detail.period === period) {
          epf_amount +=
            (parseFloat(monthly_detail.gross_salary) ||
              0 - parseFloat(monthly_detail.deductions) ||
              0) * 0.2;
          etf_amount +=
            (parseFloat(monthly_detail.gross_salary) ||
              0 - parseFloat(monthly_detail.deductions) ||
              0) * 0.03;
        }
      });
    } else {
      no_monthly.push(employee);
    }
  });
  if (no_monthly.length > 0) {
    // Create an empty string to store alert messages
    let alertMessage = `Monthly details not found for: ${company.name} - ${period}`;

    // Concatenate alert messages for each employee in `no_monthly`
    no_monthly.forEach((employee) => {
      alertMessage += `\n${employee.epf_no}-${employee.name}`;
    });

    // Display the concatenated alert message
    alert(alertMessage);
  }
  return [epf_amount, etf_amount];
};

const get_day_after = (after_days) => {
  let date = new Date();
  date.setDate(date.getDate() + after_days + 1);
  //return in yyyy-mm-dd format
  return date.toISOString().split("T")[0];
};

const generate_payment_detail = async (
  company,
  period,
  fields,
  epf_collected_day = get_day_after(1),
  epf_paid_day = get_day_after(1),
  etf_collected_day = get_day_after(1),
  etf_paid_day = get_day_after(1),
  epf_cheque_no = null,
  etf_cheque_no = null
) => {
  const emptyNewPayment = (fields) => {
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

  let emptyNew = emptyNewPayment(fields);
  const [epf_amount, etf_amount] = calculate_epf_etf_payment(period, company);
  // if (epf_amount == 0) {
  //   //alert("No monthly details found for " + period);
  //   return emptyNew;
  // }

  // Create an array of promises to await
  const promises = Object.keys(emptyNew).map(async (key) => {
    switch (key) {
      case "period":
        emptyNew[key] = period;
        break;

      case "epf_cheque_no":
        if (epf_cheque_no) {
          emptyNew[key] = epf_cheque_no;
        }
        break;
      case "etf_cheque_no":
        if (etf_cheque_no) {
          emptyNew[key] = etf_cheque_no;
        }
        break;
      case "epf_collected_day":
        emptyNew[key] = epf_collected_day;
        break;
      case "etf_collected_day":
        emptyNew[key] = etf_collected_day;
        break;
      case "epf_paid_day":
        emptyNew[key] = epf_paid_day;
        break;
      case "etf_paid_day":
        emptyNew[key] = etf_paid_day;
        break;
      case "epf_payment_method":
      case "etf_payment_method":
        emptyNew[key] = company["default_" + key];
        break;
      case "epf_amount":
        emptyNew[key] = epf_amount;
        break;
      case "etf_amount":
        emptyNew[key] = etf_amount;
        break;
      case "my_payment":
        if (!emptyNew[key]) {
          const val_my = company.my_payment || 0;
          emptyNew[key] = val_my;
        }
        break;
      case "epf_reference_no":
        const ref_no = await get_ref_no(company, period);
        //console.log(ref_no);
        emptyNew[key] = ref_no;
        break;
      default:
        break;
    }
  });

  // Wait for all promises to resolve before returning
  await Promise.all(promises);
  if (!epf_amount === 0) {
    alert(`Payment details generated for ${company.name} - ${period}`);
  }
  return emptyNew;
};

export { calculate_epf_etf_payment, generate_payment_detail, get_ref_no };
