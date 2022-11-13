import React, { useState } from 'react';
import CredentialField from '../components/CredentialField2';
import Modal from '../components/Modal';
import "./styles/_SignupLogin.scss";
import { signupUser } from "./fetchFunctions";
import {
  validateEmail, dummyValidatePassword, validateUsername,
  dummyValidation, validateMatching
} from "../utils/validationFunctions";
import PasswordRequirements from '../components/PasswordRequirements';

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

  // Handles input change and updates state
  function handleFieldChange(field) {
    setFields({
      ...fields,
      ...field
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
  errors.emailError = (fieldsClicked.email) ? validateEmail(fields.email) : null;
  errors.usernameError = (fieldsClicked.username) ? validateUsername(fields.username) : null;
  errors.passwordError = (fieldsClicked.password) ? dummyValidatePassword(fields.password) : null;
  errors.confirmPasswordError = (fieldsClicked.confirmPassword) ?
    validateMatching(fields.password, fields.confirmPassword) : null;
  errors.address1Error = (fieldsClicked.address1) ? dummyValidation("") : null;
  errors.cityError = (fieldsClicked.city) ? dummyValidation("") : null;
  errors.provinceError = (fieldsClicked.province) ? dummyValidation("") : null;
  errors.postalCodeError = (fieldsClicked.postalCode) ? dummyValidation("") : null;
  errors.address2Error = dummyValidation("");
  errors.address3Error = dummyValidation("");

  function handleSubmit(e) {
    e.preventDefault();

    let formContainsError = false;

    // Uncompleted fields
    Object.values(errors).forEach((error) => {
      if (error === null || error.error === true) {
        formContainsError = true;
      }
    });

    if (formContainsError) {
      // TODO: 
      alert("Form contains errors or uncompleted fields");
    } else {
      const userObj = {
        email: fields.email,
        username: fields.username,
        password: fields.password,
        address: {
          address1: fields.address1,
          address2: fields.address2,
          address3: fields.address3,
          city: fields.city,
          province: fields.province,
          postalCode: fields.postalCode
        }
      };

      // TODO: Return api response for displaying error on frontend******************
      signupUser(userObj);
    }
  }

  return (
    <Modal title="Welcome to Chefswap!" backgroundUrl="https://cdn.pixabay.com/photo/2021/01/31/13/18/food-5966920_1280.jpg">
      {/* <form action="/api/auth/register" method="post" className="signup-login-form"> */}
      <form onSubmit={handleSubmit} className="signup-login-form" autoComplete="off">
        <fieldset className='account-details'>
          <legend>Account Details</legend>
          <CredentialField
            type="email"
            label="*Email"
            id="email"
            size="90"
            value={fields.email}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            clicked={fieldsClicked.email}
            error={errors.emailError} />
          <CredentialField
            label="*Username"
            id="username"
            size="90"
            value={fields.username}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            clicked={fieldsClicked.username}
            error={errors.usernameError} />

          <div className="password-fields" style={{ width: "90%", display: "flex" }}>
            <CredentialField
              type="password"
              label="*Password"
              id="password"
              size="50"
              value={fields.password}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.password}
              error={errors.passwordError} />
            <CredentialField
              type="password"
              label="*Confirm Password"
              id="confirmPassword"
              size="50"
              value={fields.confirmPassword}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.confirmPassword}
              error={errors.confirmPasswordError} />
          </div>

          <PasswordRequirements
            password={fields.password}
            confirmError={errors.confirmPasswordError}
            size="85" />

        </fieldset>

        {/* Add validation HERE */}
        <fieldset className='address-details'>
          <legend>Address</legend>

          <div className="address-city-fields" style={{ width: "90%", display: "flex" }}>
            <CredentialField
              label="*Address line 1"
              id="address1"
              size="60"
              value={fields.address1}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.address1}
              error={errors.address1Error} />
            <CredentialField
              label="*City"
              id="city"
              size="40"
              value={fields.city}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.city}
              error={errors.cityError} />
          </div>

          <div className="province-postalcode-fields" style={{ width: "90%", display: "flex" }}>
            <CredentialField
              label="*Province"
              id="province"
              size="55"
              value={fields.province}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.province}
              error={errors.provinceError} />
            <CredentialField
              label="*Postal Code"
              id="postalCode"
              size="45"
              value={fields.postalCode}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.postalCode}
              error={errors.postalCodeError} />
          </div>

          <div className="optional-address-lines" style={{ width: "90%", display: "flex" }}>
            <CredentialField
              label="Address line 2"
              id="address2"
              size="50"
              value={fields.address2}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.address2}
              error={errors.address2Error} />
            <CredentialField
              label="Address line 3"
              id="address3"
              size="50"
              value={fields.address3}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              clicked={fieldsClicked.address3}
              error={errors.address3Error} />
          </div>
        </fieldset>

        <button type="submit" className="submit-btn">Start Swapping!</button>
      </form>
    </Modal >
  )
}

export default Signup