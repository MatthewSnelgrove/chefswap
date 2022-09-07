import React from 'react'
import "./_SignupLogin.scss";

function Login() {
  function handleSubmit(e) {
    e.preventDefault();
    alert("Prevented form submit.");
  }

  return (
    // <form action="/api/auth/login" method="post" className="signup-login-form">
    <form onSubmit={handleSubmit} className="signup-login-form">
      <fieldset>
        <legend>Login</legend>

        <input type="text" id="username" name="username" placeholder="*Username" required />
        <input type="password" id="password" name="password" placeholder="*Password" minLength={3} required />
      </fieldset>

      <button type="submit" className="submit-btn">Submit</button>
    </form>
  )
}

export default Login