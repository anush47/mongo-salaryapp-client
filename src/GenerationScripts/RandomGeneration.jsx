const get_random_ot_hours = (range) => {
  let ot_hours = 0;

  // Check if range is a string and not empty
  if (typeof range === "string" && range.trim() !== "") {
    const [min, max] = range.split("-").map((val) => parseInt(val.trim())); // Split and parse values to integers

    // If only one number is given, it is the value
    if (!isNaN(min) && isNaN(max)) {
      ot_hours = min;
    }
    // If both min and max are valid numbers
    else if (!isNaN(min) && !isNaN(max)) {
      ot_hours = Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  return ot_hours;
};

const get_random_total_salary = (range) => {
  let total_salary = 0;
  // Check if range is a string and not empty
  if (typeof range === "string" && range.trim() !== "") {
    const [min, max] = range.split("-").map((val) => parseFloat(val.trim())); // Split and parse values to integers

    // If only one number is given, it is the value
    if (!isNaN(min) && isNaN(max)) {
      total_salary = min;
    }
    // If both min and max are valid numbers
    else if (!isNaN(min) && !isNaN(max)) {
      total_salary = Math.random() * (max - min) + min;
    }
  }
  return total_salary;
};

const get_random_total_salary_from_variation = (salary, variation) => {
  // Parse strings to numbers
  const parsedSalary = parseFloat(salary);
  const parsedVariation = parseFloat(variation);

  if (
    !isNaN(parsedSalary) &&
    !isNaN(parsedVariation) &&
    parsedVariation !== 0
  ) {
    const halfVariation = Math.abs(parsedVariation) / 2;
    const min = Math.max(parsedSalary - halfVariation, 0);
    const max = parsedSalary + halfVariation;
    return Math.random() * (max - min) + min;
  } else {
    return parsedSalary;
  }
};

const get_random_incentive = (incentive, variation) => {
  // Parse strings to numbers
  const parsedIncentive = parseFloat(incentive);
  const parsedVariation = parseFloat(variation);

  if (
    !isNaN(parsedIncentive) &&
    !isNaN(parsedVariation) &&
    parsedVariation !== 0
  ) {
    const halfVariation = Math.abs(parsedVariation) / 2;
    const min = Math.max(parsedIncentive - halfVariation, 0);
    const max = parsedIncentive + halfVariation;
    return Math.random() * (max - min) + min;
  } else {
    return parsedIncentive;
  }
};

const get_random_incentive_from_range = (range) => {
  let incentive = 0;

  // Check if range is a string and not empty
  if (typeof range === "string" && range.trim() !== "") {
    const [min, max] = range.split("-").map((val) => parseInt(val.trim())); // Split and parse values to integers

    // If only one number is given, it is the value
    if (!isNaN(min) && isNaN(max)) {
      incentive = min;
    }
    // If both min and max are valid numbers
    else if (!isNaN(min) && !isNaN(max)) {
      incentive = Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  return incentive;
};

const get_random_incentive_allowance = (gross_salary, ot, total_salary) => {
  const ratio_difference_max = 0.4; // 0.4 means incentive can be from 0.3 to 0.7 of incentive + allowances

  // Calculate the maximum and minimum values for incentive based on the ratio difference
  const max_incentive_ratio = 0.5 + ratio_difference_max / 2;
  const min_incentive_ratio = 0.5 - ratio_difference_max / 2;

  const available_range = total_salary - (gross_salary + ot);

  // Calculate the range of incentive
  const max_incentive = available_range * max_incentive_ratio;
  const min_incentive = available_range * min_incentive_ratio;

  // Calculate the range of incentive
  const incentive_range = max_incentive - min_incentive;

  // Generate a random value within the range
  const incentive = min_incentive + Math.random() * incentive_range;

  // Calculate the corresponding allowances based on the incentive
  const allowances = total_salary - (gross_salary + ot + incentive);

  return [incentive, allowances];
};

const generate_monthly_detail = (employee, period, currentMonthly = {}) => {
  //Provide currentMonthly to generate specifics else employee will be used
  //currentMonthly should contain total_salary_range,ot_hours_range,deductions
  //returns a monthly detail

  if (currentMonthly === null) {
    currentMonthly = {};
  }
  //set values of monthlydetails

  const to_currency = (value, remove_0) => {
    if (remove_0 && value !== undefined && value == 0) {
      return "";
    }
    return value !== undefined ? value.toFixed(2) : "N/A";
  };

  const gross_salary = parseFloat(employee.gross_salary);

  const ot_hours = get_random_ot_hours(
    currentMonthly.ot_hours_range || employee.ot_hours_range
  );
  const ot = (ot_hours * 1.5 * gross_salary) / employee.divide_by;

  const total_salary = currentMonthly.total_salary_range
    ? get_random_total_salary(currentMonthly.total_salary_range)
    : get_random_total_salary_from_variation(
        employee.total_salary,
        employee.total_salary_variation
      );

  const deductions = parseFloat(currentMonthly.deductions || 0);

  let [incentive, allowances] = [0, 0];

  if (
    currentMonthly.incentive_range &&
    currentMonthly.incentive_range !== "NaN-NaN"
  ) {
    console.log(currentMonthly.incentive_range);
    if (currentMonthly.incentive_range === "0") {
      [incentive, allowances] = get_random_incentive_allowance(
        gross_salary,
        ot,
        total_salary
      );
    } else {
      incentive = get_random_incentive_from_range(
        currentMonthly.incentive_range
      );
      allowances = parseFloat(total_salary - (gross_salary + incentive + ot));
    }
  } else if (employee.incentive) {
    incentive = get_random_incentive(
      employee.incentive,
      employee.incentive_variation
    );
    allowances = parseFloat(total_salary - (gross_salary + incentive + ot));
  } else {
    [incentive, allowances] = get_random_incentive_allowance(
      gross_salary,
      ot,
      total_salary
    );
  }
  const month_salary = parseFloat(total_salary - deductions);

  let emptyNew = {};
  emptyNew.period = period;

  emptyNew.gross_salary = to_currency(gross_salary);
  emptyNew.ot_y = ot_hours !== undefined ? ot_hours + " - OT Hours" : "N/A";
  emptyNew.ot = to_currency(ot);
  emptyNew.incentive = to_currency(incentive);
  emptyNew.allowances = to_currency(allowances);
  emptyNew.deductions = to_currency(deductions, true);
  emptyNew.deductions_y = "";
  emptyNew.month_salary = to_currency(month_salary);
  emptyNew._id =
    currentMonthly._id || Date.now().toString(16).padStart(24, "0");
  //console.log(emptyNew);
  return emptyNew;
};

const generate_monthly_details = (
  company,
  period,
  currentMonthlyDetails = {}
) => {
  if (currentMonthlyDetails === null) {
    currentMonthlyDetails = {};
  }

  let monthly_details = {};

  if (company.employees) {
    company.employees.forEach((employee) => {
      let include = employee.active;
      if (currentMonthlyDetails.hasOwnProperty(employee.epf_no)) {
        // employee.epf_no is present in currentMonthlyDetails
        include = currentMonthlyDetails[employee.epf_no].include ? true : false;
      }
      if (include) {
        const md = employee.monthly_details.find((md) => md.period == period);
        if (md) {
          alert(
            `Monthly details for ${company.name} - ${employee.name} - ${period} already exists.`
          );
          return;
        }
        if (!employee.gross_salary) {
          alert(
            `employee ${employee.epf_no} - ${employee.name} does not have gross salary`
          );
          return;
        }
        let monthly_detail;
        if (currentMonthlyDetails.hasOwnProperty(employee.epf_no)) {
          monthly_detail = generate_monthly_detail(
            employee,
            period,
            currentMonthlyDetails[employee.epf_no]
          );
        } else {
          monthly_detail = generate_monthly_detail(employee, period);
        }
        monthly_details[employee.epf_no] = monthly_detail;
      }
    });
  }
  return monthly_details;
};

export {
  get_random_incentive,
  get_random_incentive_allowance,
  get_random_ot_hours,
  get_random_total_salary,
  generate_monthly_detail,
  generate_monthly_details,
};
