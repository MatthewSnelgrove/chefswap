import React from "react";
import "./styles/Logo.scss";

function Logo() {
  return (
    <div className="CSLogo">
      <img
        src={process.env.PUBLIC_URL + "/chefswap-logo.png"}
        alt="Chefswap logo"
        className="logo-img" />
      <h3 className="logo-text">Chefswap</h3>
    </div>
  )
}

export default Logo