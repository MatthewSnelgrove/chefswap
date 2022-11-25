import React, { useState } from "react";
import "./styles/_SignupLogin.scss";
import { fetchLogin } from "./fetchFunctions";
import Modal from "../components/Modal";
import CredentialField from "../components/CredentialField2";
import OnlyLoggedOut from "../components/OnlyLoggedOut";

function Login() {
  // State holding all fields needed for specific form
  const [fields, setFields] = useState({
    username: "",
    password: "",
  });

  // State holding if field clicked
  const [fieldsFocused, setFieldsFocused] = useState({
    username: false,
    password: false,
  });

  // Handles input change and updates state
  function handleFieldChange(field) {
    setFields({
      ...fields,
      ...field,
    });
  }

  // Handles onfocus for inputs and updates focused state
  function handleFieldFocus(field) {
    setFieldsFocused({
      ...fieldsFocused,
      [field]: true,
    });
  }

  // Handle login submit
  function handleSubmit(e) {
    e.preventDefault();

    // HANDLE FORM ERRORS
    let formContainsError = false;
    Object.values(fieldsFocused).forEach((focused) => {
      if (!focused) {
        formContainsError = true;
      }
    });

    if (formContainsError) {
      // TODO: Add error message on frontend *******************************************
      alert("Form contains errors or uncompleted fields");
    } else {
      // TODO: Return api response for displaying error on frontend******************
      fetchLogin(fields.password, fields.username).then((data) =>
        isSuccess(data)
      );
    }
  }

  // Callback function on login success
  function isSuccess(userObj) {
    console.log(userObj);

    if (userObj === 401) {
      alert("Invalid Credentials");
      return;
    }

    console.log(JSON.stringify({ username: fields.username, password: fields.password }))
    window.location = global.config.pages.homepage
  }

  // No errors with inputs
  return (
    <OnlyLoggedOut>
      <Modal
        title="Welcome Back!"
        backgroundUrl={
          "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fimg1.cookinglight.timeinc.net%2Fsites%2Fdefault%2Ffiles%2Fstyles%2F4_3_horizontal_-_1200x900%2Fpublic%2F1525725671%2F1805w-mise-en-place.jpg%3Fitok%3DiokQjOQ9%261525727462"
        }
      >
        {/* <form action="/api/auth/login" method="post" className="signup-login-form"> */}
        <form
          onSubmit={handleSubmit}
          className="signup-login-form"
          autoComplete="off"
        >
          <fieldset>
            <CredentialField
              label="Username"
              id="username"
              size="90"
              value={fields.username}
              onChange={handleFieldChange}
              onFocus={handleFieldFocus}
              clicked={fieldsFocused.username}
              error={null}
              required
          />
            <CredentialField
              type="password"
              label="Password"
              id="password"
              size="90"
              value={fields.password}
              onChange={handleFieldChange}
              onFocus={handleFieldFocus}
              clicked={fieldsFocused.password}
              error={null}
              required
          />
          </fieldset>

          <button type="submit" className="submit-btn">
            Log in
          </button>
        </form>
      </Modal>
    </OnlyLoggedOut>
  );
}

export default Login;
