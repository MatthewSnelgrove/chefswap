import React, { useState } from "react";
import CredentialField from "../components/CredentialField2";
import Modal from "../components/Modal";
import { signupUser } from "./fetchFunctions";
import {
  validateEmail,
  dummyValidatePassword,
  validateUsername,
  validateMatching,
  validateAddress,
  validateOptionalAddress,
  validateCity,
  validatePostalCode,
  validateProvince
} from "../utils/validationFunctions";
import PasswordRequirements from "../components/PasswordRequirements";
import OnlyLoggedOut from "../components/OnlyLoggedOut";
import Select from "react-select";
import "./styles/_SignupLogin.scss";

function Signup() {
  // State holding all fields needed for specific form
  const [fields, setFields] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    address1: "",
    city: "",
    province: "",
    postalCode: "",
    address2: "",
    address3: "",
  });

  // State holding if field clicked
  const [fieldsClicked, setFieldsClicked] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
    address1: false,
    city: false,
    province: false,
    postalCode: false,
    address2: false,
    address3: false,
  });

  // All Canadian provinces
  const provinces = [
    { value: "Ontario", label: "Ontario" },
    { value: "Quebec", label: "Quebec" },
    { value: "British Columbia", label: "British Columbia" },
    { value: "Alberta", label: "Alberta" },
    { value: "Manitoba", label: "Manitoba" },
    { value: "Saskatchewan", label: "Saskatchewan" },
    { value: "Nova Scotia", label: "Nova Scotia" },
    { value: "New Brunswick", label: "New Brunswick" },
    { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
    { value: "Prince Edward Island", label: "Prince Edward Island" },
    { value: "Northwest Territories", label: "Northwest Territories" },
    { value: "Yukon", label: "Yukon" },
    { value: "Nunavut", label: "Nunavut" },
  ];

  // Handles input change and updates state
  function handleFieldChange(field) {
    setFields({
      ...fields,
      ...field,
    });
  }

  // Handles onblur for inputs and updates clicked state
  function handleFieldBlur(field) {
    setFieldsClicked({
      ...fieldsClicked,
      [field]: true,
    });
  }

  // Errors for all inputs
  let errors = {};
  errors.emailError = fieldsClicked.email ? validateEmail(fields.email) : null;
  errors.usernameError = fieldsClicked.username
    ? validateUsername(fields.username)
    : null;
  errors.passwordError = fieldsClicked.password
    ? dummyValidatePassword(fields.password)
    : null;
  errors.confirmPasswordError = fieldsClicked.confirmPassword
    ? validateMatching(fields.password, fields.confirmPassword)
    : null;
  errors.address1Error = fieldsClicked.address1 ? validateAddress(fields.address1) : null;
  errors.cityError = fieldsClicked.city ? validateCity(fields.city) : null;
  errors.postalCodeError = fieldsClicked.postalCode
    ? validatePostalCode(fields.postalCode)
    : null;
  errors.address2Error = fieldsClicked.address2 ? validateOptionalAddress(fields.address2) : null;
  errors.address3Error = fieldsClicked.address3 ? validateOptionalAddress(fields.address3) : null;

  errors.provinceError = fieldsClicked.province ? validateProvince(fields.province) : null;

  function handleSubmit(e) {
    e.preventDefault();

    let formContainsError = false;

    // Uncompleted fields
    Object.keys(errors).forEach((field) => {
      if ((field === "address2Error" || field === "address3Error")) {
        if (errors[field]?.error) formContainsError = true;
      }

      else if (!errors[field] || errors[field].error) {
        console.log("ERROR");
        formContainsError = true;
      }
    });

    if (formContainsError) {
      // TODO:
      alert("Form contains errors or uncompleted fields");
    } else {
      const userObj = {
        profile: {
          username: fields.username,
          bio: "",
          circle: {
            radius: 3000
          }
        },
        email: fields.email,
        password: fields.password,
        address: {
          address1: fields.address1,
          address2: fields.address2,
          address3: fields.address3,
          city: fields.city,
          province: fields.province,
          postalCode: fields.postalCode,
        },
      };

      // TODO: Return api response for displaying error on frontend******************
      signupUser(userObj);
    }
  }

  return (
    <OnlyLoggedOut>
      <Modal
        title="Welcome to Chefswap!"
        backgroundUrl="https://cdn.pixabay.com/photo/2021/01/31/13/18/food-5966920_1280.jpg"
      >
        {/* <form action="/api/auth/register" method="post" className="signup-login-form"> */}
        <form
          onSubmit={handleSubmit}
          className="signup-login-form"
          autoComplete="off"
        >
          <fieldset className="account-details">
            <legend>Account Details</legend>
            <CredentialField
              type="email"
              label="Email *"
              id="email"
              size="90"
              value={fields.email}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.email}
              error={errors.emailError}
              required
            />
            <CredentialField
              label="Username *"
              id="username"
              size="90"
              value={fields.username}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.username}
              error={errors.usernameError}
              required
            />

            <div
              className="password-fields"
              style={{ width: "90%", display: "flex" }}
            >
              <CredentialField
                type="password"
                label="Password *"
                id="password"
                size="50"
                value={fields.password}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                clicked={fieldsClicked.password}
                error={errors.passwordError}
                required
              />
              <CredentialField
                type="password"
                label="Confirm Password *"
                id="confirmPassword"
                size="50"
                value={fields.confirmPassword}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                clicked={fieldsClicked.confirmPassword}
                error={errors.confirmPasswordError}
              />
            </div>

            <PasswordRequirements
              password={fields.password}
              confirmError={errors.confirmPasswordError}
              size="85"
            />
          </fieldset>

          {/* Add validation HERE */}
          <fieldset className="address-details">
            <legend>Address</legend>

            <CredentialField
              label="Address 1 *"
              id="address1"
              size="90"
              value={fields.address1}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.address1}
              error={errors.address1Error}
            />
            <CredentialField
              label="City *"
              id="city"
              size="90"
              value={fields.city}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.city}
              error={errors.cityError}
            />

            {/* <CredentialField
            label="Province *"
            id="province"
            size="90"
            value={fields.province}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            clicked={fieldsClicked.province}
            error={errors.provinceError}
          /> */}

            <Select
              className="province-dropdown"
              classNamePrefix="province-dropdown"
              options={provinces}
              isClearable={true}
              isSearchable={true}
              placeholder={<div>Province *</div>}
              name="province"
              required
              onChange={() => {
                setTimeout(() => {
                  let province = document.getElementsByName("province")[0].value;
                  console.log(`Province: ${province}`);
                  handleFieldChange({ province: province })
                }, 100);
              }}
              onBlur={() => {
                handleFieldBlur("province");
              }}
              styles={{
                control: styles => {
                  return {
                    ...styles,
                    ":focus": {
                      boxShadow: "0 0 0 1px #FB8C00",
                      borderColor: "#FB8C00"
                    }
                  }
                },
                option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                  return {
                    ...styles,
                    backgroundColor: isSelected
                      ? "#FFA726"
                      : isFocused
                        ? "#ffa8262f"
                        : "white",
                    ":active": {
                      ...styles[":active"],
                      backgroundColor: "#ffa8266d"
                    }
                  }
                }
              }}
            />

            <div
              className="input-error-msg"
              id={"province-error-msg"}
              style={{
                visibility: errors.provinceError?.error ? "visible" : "hidden",
                width: "86%",
                marginBottom: "18px"
              }}
            >
              {errors.provinceError?.msg || "sdasd"}
            </div>

            <CredentialField
              label="Postal Code *"
              id="postalCode"
              size="90"
              value={fields.postalCode}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.postalCode}
              error={errors.postalCodeError}
            />

            <div
              className="optional-address-lines"
              style={{ width: "90%", display: "flex" }}
            >
              <CredentialField
                label="Address line 2"
                id="address2"
                size="50"
                value={fields.address2}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                clicked={fieldsClicked.address2}
                error={errors.address2Error}
              />
              <CredentialField
                label="Address line 3"
                id="address3"
                size="50"
                value={fields.address3}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                clicked={fieldsClicked.address3}
                error={errors.address3Error}
              />
            </div>
          </fieldset>

          <button type="submit" className="submit-btn">
            Start Swapping!
          </button>
        </form>
      </Modal>
    </OnlyLoggedOut>
  );
}

export default Signup;
