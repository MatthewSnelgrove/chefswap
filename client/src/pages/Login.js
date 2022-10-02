import React, { useState } from 'react'
import "./styles/_SignupLogin.scss";
import Modal from "../components/Modal";
import CredentialField from "../components/CredentialField";
import { validateUsername, validatePassword } from "../pages/validationFunctions";

function Login() {
  const [hasError, setHasError] = useState({
    username: true,
    password: true,
  });

  function handleSubmit(e) {
    e.preventDefault();

    // Check for form errors
    if (Object.values(hasError).includes(true)) {
      // TODO: Replace with error message shown on screen
      alert("Form error found");
    }

    else {
      // TODO: Replace with form submission logic
      alert("All inputs valid")
    }
  }

  function handleErrorUpdate(name, bool) {
    let newError = hasError;
    newError[name] = bool;

    setHasError(newError);
  }

  return (
    <Modal backgroundUrl={"https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fimg1.cookinglight.timeinc.net%2Fsites%2Fdefault%2Ffiles%2Fstyles%2F4_3_horizontal_-_1200x900%2Fpublic%2F1525725671%2F1805w-mise-en-place.jpg%3Fitok%3DiokQjOQ9%261525727462"}>
      {/* <form action="/api/auth/login" method="post" className="signup-login-form"> */}
      <form onSubmit={handleSubmit} className="signup-login-form">
        <fieldset>

          {/* <input type="text" id="username" name="username" placeholder="*Username" required />
          <input type="password" id="password" name="password" placeholder="*Password" minLength={3} required /> */}
          <CredentialField label="Username" validateFcn={validateUsername}
            onUpdate={handleErrorUpdate} size={80} />
          <CredentialField type="password" label="Password" validateFcn={validatePassword}
            onUpdate={handleErrorUpdate} size={80} />
        </fieldset>

        <button type="submit" className="submit-btn">Log in</button>
      </form>
    </Modal>
  )
}

export default Login