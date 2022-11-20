import React, { useState } from "react";
import "../components/styles/CredentialField.scss";

/**
 * Represents a text input field with input validation
 * @param {Object} props
 * @param {String} type Input type (e.g., password, text, email)
 * @param {String} label Label name for input field (starting with upper case)
 * @param {String} name Optional name for id
 * @param {Function} validateFcn Input validation function from validationFunctions.js
 * @param {Number} size Optional percent width of input field
 * @param {Function} onUpdate Parent function to handle error updates
 */
function CredentialField({
  type = "text",
  label,
  name,
  validateFcn,
  size = 100,
  onUpdate,
}) {
  const [error, setError] = useState({
    error: false,
    msg: "",
  });
  const [clicked, setClicked] = useState(false);

  if (
    !label ||
    !validateFcn ||
    !onUpdate ||
    typeof validateFcn !== "function" ||
    typeof onUpdate !== "function"
  ) {
    throw new Error("Missing arguments");
  }

  // Logic for error message
  let isVisible = error.error ? "visible" : "hidden";
  let borderColor;
  if (!error.error && error.msg === "success") borderColor = "3px solid green";
  else if (error.error) borderColor = "3px solid red";

  // If name was not provided
  if (!name) {
    name = label[0].toLowerCase() + label.slice(1, label.length);
  }

  function animateLabelUp() {
    let label = document.querySelector(`#${name}-label`);
    label.style.top = "-12px";
    label.style.fontSize = "0.85em";
  }

  function animateLabelDown() {
    let label = document.querySelector(`#${name}-label`);
    label.style.top = "10px";
    label.style.fontSize = "1em";
  }

  function handleInputBlur() {
    let inputValue = document.querySelector(`#${name}`).value;

    // check if input is empty
    if (!inputValue) animateLabelDown();

    // validate input
    let newError = validateFcn(inputValue);
    setError(newError);
    setClicked(true);

    // update parent form state
    onUpdate(name, newError.error);
  }

  function handleInputChange() {
    animateLabelUp();
    if (clicked) {
      handleInputBlur();
    }
  }

  return (
    <div className="form-input-container" style={{ width: `${size}%` }}>
      <input
        autoComplete="stoppleaseihatechrome"
        type={type}
        id={name}
        name={name}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        onFocus={animateLabelUp}
        style={{ borderBottom: borderColor }}
      />
      <label htmlFor={name} className="input-label" id={name + "-label"}>
        {label}
      </label>

      <div
        className="input-error-msg"
        id={name + "-error-msg"}
        style={{ visibility: isVisible }}
      >
        {error.msg || ""}
      </div>
    </div>
  );
}

export default CredentialField;
