import React from 'react';
import "./styles/_SignupLogin.scss";
import { signupUser } from "./fetchFunctions"

function Signup() {

  // function cleanseObj(Obj) {
  //   var newObj = {}
    
  //   Object.keys(Obj).map((key) => {
  //     if (Obj[key] != "") {
  //       newObj[key] = Obj[key]
  //     }
  //   })

  //   return newObj
  // }

  function getVal(id) {
    return document.getElementById(id).value
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    const userObj = {
      email: getVal("email"),
      username: getVal("username"),
      password: getVal("password"),
      address: {
        address1: getVal("address"),
        address2: getVal("address2"),
        address3: getVal("address3"),
        city: getVal("city"),
        province: getVal("province"),
        postalCode: getVal("postalCode")
      } 
    }

    signupUser(userObj)
    
  }

  return (
    // <form action="/api/auth/register" method="post" className="signup-login-form">
    <form onSubmit={handleSubmit} className="signup-login-form">
      <fieldset>
        <legend>Account Details</legend>

        <input type="email" id="email" name="email" placeholder="*Email" required />
        <input type="text" id="username" name="username" placeholder="*Username" required />
        <input type="password" id="password" name="password" placeholder="*Password" minLength={3} required />
      </fieldset>

      <fieldset>
        <legend>Address</legend>

        {/* TODO: Add G Maps API? */}
        <input type="text" id="address" name="address1" placeholder="*Address" required />
        <input type="text" id="city" name="city" placeholder="*City" required />
        <input type="text" id="province" name="province" placeholder="*Province" required />
        <input type="text" id="postalCode" name="postalCode" placeholder="*Postal Code" pattern="([A-Z]\d){3}" title="Please enter a valid postal code (e.g. A1A1A1)" required />

        <input type="text" id="address2" name="address2" placeholder="Optional address line 2" />
        <input type="text" id="address3" name="address3" placeholder="Optional address line 3" />
      </fieldset>

      <button type="submit" className="submit-btn">Submit</button>
    </form>
  )
}

export default Signup