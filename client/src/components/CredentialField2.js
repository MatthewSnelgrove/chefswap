import React from "react";
import "./styles/CredentialField.scss";

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
 * @param {Object} error Error object from validateFunctions.js
 * @param {Boolean} required Required tag for inputs
 */
function CredentialField2({
  type = "text",
  label,
  id,
  size,
  value,
  onChange,
  onBlur = () => { },
  onFocus = () => { },
  clicked,
  error,
  required = false,
}) {
  // Logic for handling error message styles
  let fieldBorder = "3px solid gray";
  let errorVisibility = "hidden";

  if (error?.error) {
    fieldBorder = "3px solid red";
    errorVisibility = "visible";
  }
  if (error?.error === false) {
    fieldBorder = "3px solid green";
  }

  // Functions for animating label up and down
  function animateLabelUp() {
    let label = document.querySelector(`#${id}-label`);
    label.style.top = "-12px";
    label.style.fontSize = "0.85em";
  }

  function animateLabelDown() {
    let label = document.querySelector(`#${id}-label`);
    label.style.top = "10px";
    label.style.fontSize = "1em";
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

  // Remove * from beginning if focused
  let labelText = clicked ? label.replace("*", "") : label;

  return (
    <div
      className="form-input-container"
      id={id + "-input-container"}
      style={{ width: `${size}%` }}
    >
      <input
        autoComplete="off"
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ borderBottom: fieldBorder }}
        required={required} />
      <label
        htmlFor={id}
        className="input-label"
        id={id + "-label"}>
        {labelText}
      </label>

      <div
        className="input-error-msg"
        id={id + "-error-msg"}
        style={{ visibility: errorVisibility }}
      >
        {error?.msg || ""}
      </div>
    </div>
  );
}

export default CredentialField2;
