import React from 'react';
import Requirement from "./Requirement";

/**
 * Password requirements box, including the requirements:
 * - 6-50 characters long
 * - include one lowercase char
 * - include one uppercase char
 * - include one number
 */
function PasswordRequirements({ password, confirmError, size = 100 }) {

  // Determine what errors to display from passwordInput
  let lengthPass = true, uppercasePass = true, lowercasePass = true, numberPass = true, matchingPass = true;

  if (password.length < 6 || password.length > 50) {
    lengthPass = false;
  } if (!password.match(/[a-z]/)) {
    lowercasePass = false;
  } if (!password.match(/[A-Z]/)) {
    uppercasePass = false;
  } if (!password.match(/\d/)) {
    numberPass = false;
  } if (confirmError === null || confirmError.error) {
    matchingPass = false;
  }

  return (
    <div className="requirements-container" style={{
      width: size + "%", marginBottom: "20px"
    }}>
      <Requirement pass={lengthPass} requirementText="6-30 characters long" />
      <Requirement pass={lowercasePass} requirementText="Contains a lowercase letter" />
      <Requirement pass={uppercasePass} requirementText="Contains an uppercase letter" />
      <Requirement pass={numberPass} requirementText="Contains a number" />
      <Requirement pass={matchingPass} requirementText="Passwords match" />
    </div>
  )
}

export default PasswordRequirements