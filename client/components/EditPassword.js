import { React, useState } from "react";
import styles from "./styles/EditPassword.module.scss";
import fieldStyles from "./styles/EditProfile.module.css";
import { changePassword } from "../utils/changeFunctions";
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";
import CredentialField from "../components/CredentialField2";
import {
  dummyValidatePassword,
  validateMatching,
} from "../utils/validationFunctions";
import PasswordRequirements from "./PasswordRequirements";
import { toast } from "react-toastify";
import global_vars from "../utils/config";

// function onSubmit(ev, Uid) {
//   const password = ev.target[0].value;
//   const confirmPassword = ev.target[1].value;

//   if (password != confirmPassword) {
//     alert("Passwords do not match");
//     return;
//   }

//   changePassword(Uid, fields.password);
// }

function EditPassword() {
  // State holding all fields needed for specific form
  const [fields, setFields] = useState({
    password: "",
    confirmPassword: "",
  });

  // State holding if field clicked
  const [fieldsClicked, setFieldsClicked] = useState({
    password: false,
    confirmPassword: false,
  });

  // State holding form error message
  const [formError, setFormError] = useState("");

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

  let errors = {};
  errors.password = dummyValidatePassword(fields.password);
  errors.confirmPassword = validateMatching(
    fields.password,
    fields.confirmPassword
  );

  function handleSubmit(e, uid) {
    e.preventDefault();

    let formContainsError = [];

    // Uncompleted fields
    Object.keys(errors).forEach((field) => {
      if (errors[field].error) {
        formContainsError.push(field);
      }
    });

    if (formContainsError.length > 0) {
      let errorMsg = "Errors were found in the following field(s):";
      formContainsError.forEach((field) => {
        errorMsg += ` ${field},`;
      });

      // Focus on first input with error
      document.getElementById(formContainsError[0]).focus();

      // Set form error
      setFormError(errorMsg.slice(0, -1));
    } else {
      // Handle API call to change password
      let changePromise = changePassword(uid, fields.password);

      changePromise
        .then((res) => {
          console.log(res.status);
          if (res.status === 204) {
            toast.success(`Successfully changed password`, {
              position: toast.POSITION.TOP_RIGHT,
            });
          } else return res.json();
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
          console.log("Unexpected error in changePasswordPromise: " + err);
        });
    }
  }

  const user = useUser();
  const globalVars = global_vars;

  if (user == globalVars.userStates.loading) return <></>;

  return (
    <form
      onSubmit={(e) => handleSubmit(e, user.accountUid)}
      className={styles.edit_container}
    >
      <div className={styles.pfp_container} style={{ marginTop: "35px" }}>
        <div>
          <ProfilePicture pfpLink={user.pfpLink} />
        </div>
        <div>
          <h1
            style={{
              marginTop: "10px",
              fontSize: "25px",
              marginBottom: "10px",
            }}
          >
            {user.username}
          </h1>
        </div>
      </div>
      <div
        style={{
          width: "80%",
          display: "flex",
          justifyContent: "center",
          marginTop: "30px",
          marginLeft: "-10px",
          maxWidth: 500,
        }}
      >
        <CredentialField
          type="password"
          label="Password"
          id="password"
          size="100"
          value={fields.password}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          clicked={fieldsClicked.password}
          error={errors.password}
          required
        />
      </div>
      <div
        style={{
          width: "80%",
          display: "flex",
          justifyContent: "center",
          marginLeft: "-10px",
          maxWidth: 500,
        }}
      >
        {/* <button className="submitBtn" style={{marginTop: "25px", marginBottom: "25px"}}>Change Password</button> */}

        <CredentialField
          type="password"
          label="Confirm Password"
          id="confirmPassword"
          size="100"
          value={fields.confirmPassword}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          clicked={fieldsClicked.confirmPassword}
          error={errors.confirmPassword}
          required
        />
      </div>

      <PasswordRequirements
        password={fields.password}
        confirmError={errors.confirmPassword}
        size="80"
      />

      <div
        className={styles.input_error_msg} // TODO: fix classname styles
        id="form-error-msg"
        style={{
          visibility: !formError ? "hidden" : "visible",
          width: "80%",
          fontSize: "1em",
          color: "red",
        }}
      >
        {formError}
      </div>

      <button
        className={fieldStyles.submitBtn}
        style={{ marginTop: "20px", width: "50%" }}
      >
        Submit
      </button>
    </form>
  );
}

export default EditPassword;
