import React from 'react'
import "./styles/_SignupLogin.scss";
import { fetchLogin } from "./fetchFunctions"


function Login() {


  function isSuccess(userObj) {
    console.log(userObj)
    
    if (userObj == 401) {
      alert("Invalid Credentials")
      return;
    }

    window.location = "http://localhost:3000/"
  }

  function handleSubmit(e) {
    e.preventDefault();
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value


    console.log(username, password)

    console.log(JSON.stringify({username: username, password: password}))
    fetchLogin(password, username).then((data) => isSuccess(data))
  }

  return (
    // <form action="/api/auth/login" method="post" className="signup-login-form">
    <form onSubmit={handleSubmit} className="signup-login-form" style ={{marginTop: "100px"}}>
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