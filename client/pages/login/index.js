import React, { useState } from "react";
import { fetchLogin } from "../../utils/fetchFunctions";
import Modal from "../../components/Modal";
import CredentialField from "../../components/CredentialField2";
import OnlyLoggedOut from "../../components/OnlyLoggedOut";
import {
  validateUsername,
  validatePassword,
} from "../../utils/validationFunctions";
import styles from "../../styles/Signup.module.scss";
import global_vars from "../../utils/config";
import fieldStyles from "../../components/styles/CredentialField.module.scss";
import Head from "next/head";

function Login() {
  // State holding all fields needed for specific form
  const [fields, setFields] = useState({
    username: "",
    password: "",
  });

  // State holding if field clicked
  const [fieldsClicked, setFieldsClicked] = useState({
    username: false,
    password: false,
  });

  // State holding form error
  const [formError, setFormError] = useState("");

  // Handles input change and updates state
  function handleFieldChange(field) {
    setFields({
      ...fields,
      ...field,
    });
  }

  // Handles onblur for inputs and updates focused state
  function handleFieldBlur(field) {
    setFieldsClicked({
      ...fieldsClicked,
      [field]: true,
    });
  }

  // Errors for all inputs
  let errors = {};
  errors.username = validateUsername(fields.username);
  errors.password = validatePassword(fields.password);

  // Handle login submit
  function handleSubmit(e) {
    e.preventDefault();

    // HANDLE FORM ERRORS
    let formContainsError = [];
    Object.keys(errors).forEach((field) => {
      if (errors[field].error) formContainsError.push(field);
    });

    if (formContainsError.length > 0) {
      let errorMsg = "Errors were found in the following field(s): ";
      formContainsError.forEach((field) => {
        errorMsg += ` ${field},`;
      });

      // Focus on first input with error
      document.getElementById(formContainsError[0]).focus();

      // Set form error
      setFormError(errorMsg.slice(0, -1));
    } else {
      let loginPromise = fetchLogin(fields.password, fields.username);

      loginPromise
        .then((res) => {
          if (res.status !== 200 && res.status !== 201) {
            return res.json();
          } else {
            window.location = global_vars.pages.homepage;
          }
        })
        .then((json) => {
          console.log(json[0].detail);

          // Scroll to form error message
          document
            .getElementById("form-error-msg")
            .scrollIntoView({ behavior: "smooth" });

          // Set form error from server
          setFormError(json[0].detail);
        })
        .catch((err) => {
          console.log("Unexpected error in loginPromise: " + err);
        });
    }
  }

  // No errors with inputs
  return (
    <>
      <Head>
        <title>Chefswap | Login</title>
      </Head>

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
            className={styles.signup_login_form}
            autoComplete="off"
          >
            <fieldset>
              <CredentialField
                label="Username"
                id="username"
                size="90"
                value={fields.username}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                clicked={fieldsClicked.username}
                error={errors.username}
                required
              />
              <CredentialField
                type="password"
                label="Password"
                id="password"
                size="90"
                value={fields.password}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                clicked={fieldsClicked.password}
                error={errors.password}
                required
              />
            </fieldset>

            <div
              className={fieldStyles.input_error_msg}
              id="form-error-msg"
              style={{
                visibility: !formError ? "hidden" : "visible",
                width: "90%",
                fontSize: "1em",
                textAlign: "center",
                marginTop: "15px",
              }}
            >
              {formError}
            </div>

            <button type="submit" className={styles.submit_btn}>
              Log in
            </button>
          </form>
        </Modal>
      </OnlyLoggedOut>
    </>
  );
}

export default Login;
