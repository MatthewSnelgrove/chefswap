import { React, useState, useEffect } from "react";
import { fetchSpecific } from "../utils/fetchFunctions";
import { changeAddress, changeEmail } from "../utils/changeFunctions";
import Select from "react-select";
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";
import CredentialField from "../components/CredentialField2";
import {
  validateAddress,
  validateCity,
  validateEmail,
  validateOptionalAddress,
  validatePostalCode,
  validateProvince,
} from "../utils/validationFunctions";
import { toast } from "react-toastify";
import styles from "./styles/EditPassword.module.scss";
import fieldStyles from "./styles/EditProfile.module.css";
import global_vars from "../utils/config";

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

function cleanEmptyJSON(JSON) {
  return Object.fromEntries(
    Object.entries(JSON).filter((details) => {
      return (
        details[1] != "" &&
        details[0] !== "latitude" &&
        details[0] !== "longitude"
      );
    })
  );
}

function EditPersonal(props) {
  // State holding all fields needed for specific form
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState({
    address1: "",
    address2: "",
    address3: "",
    province: "",
    city: "",
    postalCode: "",
  });

  // State holding if fields clicked
  const [emailClicked, setEmailClicked] = useState(false);
  const [addressClicked, setAddressClicked] = useState({
    address1: false,
    address2: false,
    address3: false,
    province: false,
    city: false,
    postalCode: false,
  });

  // State holding form error message
  const [emailError, setEmailError] = useState("");
  const [addressError, setAddressError] = useState("");

  // Handles input change and updates state
  function handleEmailChange(field) {
    setEmail(field.email);
  }
  function handleAddressChange(field) {
    setAddress({
      ...address,
      ...field,
    });
  }

  // Handles onblur for inputs and updates clicked state
  function handleEmailBlur() {
    setEmailClicked(true);
  }
  function handleAddressBlur(field) {
    setAddressClicked({
      ...addressClicked,
      [field]: true,
    });
  }

  // Handle input errors
  let errors = {};
  errors.email = validateEmail(email);
  errors.address = {};
  errors.address.address1 = validateAddress(address.address1);
  errors.address.address2 = validateOptionalAddress(address.address2);
  errors.address.address3 = validateOptionalAddress(address.address3);
  errors.address.province = validateProvince(address.province);
  errors.address.city = validateCity(address.city);
  errors.address.postalCode = validatePostalCode(address.postalCode);

  // Handle email submit
  // Note: ignore console error if status is 200
  function handleEmailSubmit(e, uid) {
    e.preventDefault();

    if (errors.email.error) {
      // Focus on first input with error
      document.getElementById("email").focus();

      // Set form error
      setEmailError(`Error found in email: ${errors.email.msg}`);
    } else {
      // Handle API call to change password
      let emailPromise = changeEmail(uid, { email: email });

      emailPromise
        .then((res) => {
          console.log(res.status);
          if (res.status === 200) {
            toast.success(`Successfully changed email`, {
              position: toast.POSITION.TOP_RIGHT,
            });
          } else return res.json();
        })
        .then((json) => {
          console.log(json);
          console.log(json[0].detail);

          // Scroll to form error message
          document
            .getElementById("form-error-msg")
            .scrollIntoView({ behavior: "smooth" });

          // Set form error from server
          setEmailError(json[0].detail);
        })
        .catch((err) => {
          console.log("Unexpected error in emailPromise: " + err);
        });
    }
  }

  // Handle address submit
  function handleAddressSubmit(e, uid) {
    e.preventDefault();

    let formContainsError = [];

    // Uncompleted fields
    Object.keys(errors.address).forEach((field) => {
      if (errors.address[field].error) {
        formContainsError.push(field);
      }
    });

    if (formContainsError.length > 0) {
      // Focus on first input with error
      document.getElementById(formContainsError[0]).focus();

      // Set form error
      setAddressError(`Error found in address: ${errors.address.msg}`);
    } else {
      // Handle API call to change password
      let addressPromise = changeAddress(uid, cleanEmptyJSON(address));

      addressPromise
        .then((res) => {
          console.log(res.status);
          if (res.status === 200) {
            toast.success(`Successfully changed address`, {
              position: toast.POSITION.TOP_RIGHT,
            });
          } else return res.json();
        })
        .then((json) => {
          console.log(json[0]);

          // Scroll to form error message
          document
            .getElementById("form-error-msg")
            .scrollIntoView({ behavior: "smooth" });

          // Set form error from server
          setAddressError(json[0].detail);
        })
        .catch((err) => {
          console.log("Unexpected error in addressPromise: " + err);
        });
    }
  }

  const user = useUser();
  const globalVars = global_vars;
  const loading = globalVars.userStates.loading;

  // Populate existing user data on fields
  useEffect(() => {
    if (user == loading) {
      return;
    }
    fetchSpecific(user.accountUid, "email").then((email) =>
      setEmail(email.email)
    );
    fetchSpecific(user.accountUid, "address").then((fetchedAddress) => {
      setAddress((adr) => {
        return {
          ...adr,
          ...fetchedAddress,
        };
      });
    });
  }, [user]);

  if (user == loading || email == null || address == null) {
    return <></>;
  }

  const provinceSelect = document.querySelector(".province-select");

  if (provinceSelect) {
    provinceSelect.value = address.province;
  }

  return (
    <div className={styles.personal_container}>
      <div className={styles.graphics_container}>
        <ProfilePicture pfpLink={user.pfpLink} />
      </div>

      <div className={styles.fields_container}>
        <h1 style={{ marginTop: "10px", fontSize: "25px" }}>{user.username}</h1>

        <div
          className={styles.info_text}
          style={{ fontWeight: "600", marginTop: "25px" }}
        >
          Change Email
        </div>
        <div className={styles.info_text}>
          You can change your email without changing your address
        </div>

        <form
          onSubmit={(e) => handleEmailSubmit(e, user.accountUid)}
          style={{ width: "100%" }}
        >
          <div style={{ marginTop: "30px", width: "80%", marginLeft: "-10px" }}>
            <CredentialField
              type="email"
              label="Email"
              id="email"
              size={100}
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              clicked={emailClicked}
              error={errors.email}
              required
            />
          </div>
          <button
            className={fieldStyles.submitBtn}
            style={{ marginTop: "20px" }}
          >
            Change Email
          </button>
        </form>

        <div
          className={styles.input_error_msg}
          id="form-error-msg"
          style={{
            visibility: !emailError ? "hidden" : "visible",
            width: "90%",
            fontSize: "1em",
            textAlign: "center",
          }}
        >
          {emailError}
        </div>

        <div
          className={styles.info_text}
          style={{
            fontWeight: "600",
            marginTop: "35px",
            marginBottom: "0px",
          }}
        >
          Change Address
        </div>
        <div className={styles.info_text}>
          You can change your address without changing your email
        </div>

        <form
          onSubmit={(e) => handleAddressSubmit(e, user.accountUid)}
          style={{ width: "100%" }}
        >
          <div style={{ marginTop: "30px", width: "80%", marginLeft: "-10px" }}>
            <CredentialField
              type="text"
              label="Address line 1"
              id="address1"
              size={100}
              value={address.address1}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              clicked={true}
              error={errors.address.address1}
            />
          </div>
          <div style={{ marginTop: "30px", width: "80%", marginLeft: "-10px" }}>
            <CredentialField
              type="text"
              label="Address line 2"
              id="address2"
              size={100}
              value={address.address2}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              clicked={addressClicked.address2}
              error={errors.address.address2}
            />
          </div>
          <div
            style={{
              marginTop: "30px",
              width: "80%",
              marginLeft: "-10px",
              marginBottom: "20px",
            }}
          >
            <CredentialField
              type="text"
              label="Address line 3"
              id="address3"
              size={100}
              value={address.address3}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              clicked={addressClicked.address3}
              error={errors.address.address3}
            />
          </div>

          <div style={{ width: "80%" }}>
            <Select
              className="province-dropdown"
              classNamePrefix="province-dropdown"
              options={provinces}
              isClearable={true}
              isSearchable={true}
              placeholder={<span>Province</span>}
              name="province"
              value={provinces.find((obj) => obj.value === address.province)}
              onChange={(e) => {
                let province = e.value;
                console.log(`Province: ${province}`);
                handleAddressChange({ province: province });
              }}
              onBlur={() => {
                handleAddressBlur("province");
              }}
              styles={{
                control: (styles) => {
                  return {
                    ...styles,
                    ":focus": {
                      boxShadow: "0 0 0 1px #FB8C00",
                      borderColor: "#FB8C00",
                    },
                  };
                },
                option: (
                  styles,
                  { data, isDisabled, isFocused, isSelected }
                ) => {
                  return {
                    ...styles,
                    backgroundColor: isSelected
                      ? "#FFA726"
                      : isFocused
                      ? "#ffa8262f"
                      : "white",
                    ":active": {
                      ...styles[":active"],
                      backgroundColor: "#ffa8266d",
                    },
                  };
                },
              }}
            />
          </div>

          <div style={{ marginTop: "50px", width: "80%", marginLeft: "-10px" }}>
            <CredentialField
              type="city"
              label="City"
              id="city"
              size={100}
              value={address.city}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              clicked={addressClicked.city}
              error={errors.address.city}
            />
          </div>

          <div style={{ marginTop: "30px", width: "80%", marginLeft: "-10px" }}>
            <CredentialField
              type="text"
              label="Postal Code"
              id="postalCode"
              size={100}
              value={address.postalCode}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              clicked={addressClicked.postalCode}
              error={errors.address.postalCode}
            />
          </div>

          <button
            className={fieldStyles.submitBtn}
            style={{ marginTop: "20px" }}
          >
            Change address info
          </button>
        </form>

        <div
          className={styles.input_error_msg}
          id="form-error-msg"
          style={{
            visibility: !addressError ? "hidden" : "visible",
            width: "90%",
            fontSize: "1em",
            textAlign: "center",
          }}
        >
          {addressError}
        </div>
      </div>
    </div>
  );
}

export default EditPersonal;
