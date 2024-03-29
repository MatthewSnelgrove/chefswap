import React, { useState, useEffect } from "react";
import styles from "./styles/CredentialField.module.scss";

/**
 * Represents a text input field with input validation
 * @param {Object} props
 * @param {String} type Input type (e.g., password, text, email)
 * @param {String} label Label name for input field (starting with upper case)
 * @param {String} id Id and name value
 * @param {Function} onChange Function to handle input change
 * @param {Function} onBlur Function to handle input blur (signup only)
 * @param {Function} onFocus Function to handle input focus (login only)
 * @param {Boolean} clicked Whether input has been focused or not
 * @param {Object} error Error object from validateFunctions.js (NON-NULL)
 * @param {Boolean} required Required tag for inputs
 */
function CredentialField2({
  type = "text",
  label,
  id,
  size,
  value,
  onChange,
  onBlur = () => {},
  onFocus = () => {},
  clicked,
  error,
  required = false,
}) {
  // State holding label styles
  const [labelStyles, setLabelStyles] = useState({
    top: "10px",
    fontSize: "1em",
  });

  useEffect(() => {
    if (value) animateLabelUp();
  }, [value]);

  // Logic for handling error message styles
  let fieldBorder = "3px solid gray";
  let errorVisibility = "hidden";

  if (clicked) {
    if (error.error) {
      fieldBorder = "3px solid red";
      errorVisibility = "visible";
    }
    if (!error.error) {
      fieldBorder = "3px solid green";
    }
  }

  // Functions for animating label up and down
  function animateLabelUp() {
    setLabelStyles({
      top: "-12px",
      fontSize: "0.85em",
    });
  }

  function animateLabelDown() {
    setLabelStyles({
      top: "10px",
      fontSize: "1em",
    });
  }

  // Animate label up when focused
  function handleFocus() {
    animateLabelUp();

    // Set focused state in login page ONLY
    onFocus(id);
  }

  // Passing typed value back to FormContainer
  function handleChange() {
    let text = document.getElementById(id).value;

    let field = {
      [id]: text,
    };

    console.log(field); // log
    onChange(field);
  }

  // Handle blur
  function handleBlur() {
    if (!value) animateLabelDown();

    console.log(id + " just blurred"); // log
    onBlur(id);
  }

  return (
    <div
      className={styles.form_input_container}
      id={id + "-input-container"}
      style={{ width: `${size}%` }}
    >
      <input
        autoComplete="none"
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ borderBottom: fieldBorder }}
        required={required}
      />
      <label
        htmlFor={id}
        className={styles.input_label}
        id={id + "-label"}
        style={labelStyles}
      >
        {label}
      </label>

      <div
        className={styles.input_error_msg}
        id={id + "-error-msg"}
        style={{ visibility: errorVisibility }}
      >
        {error?.msg || ""}
      </div>
    </div>
  );
}

export default CredentialField2;
