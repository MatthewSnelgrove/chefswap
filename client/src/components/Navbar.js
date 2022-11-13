import React from 'react';
import "./styles/Navbar.scss";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-sm bg-light navbar-fixed">
      <div className="container-fluid">
        <a className="navbar-brand" href="/about">Chefswap</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" aria-current="page" href="/my-swaps">My Swaps</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/find-swap">Find a Swap</a>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto pe-3">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Learn More
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/about">About Chefswap</a></li>
                <li><a className="dropdown-item" href="/about-us">About Us</a></li>
                <li><a className="dropdown-item" href="/help">Help</a></li>
              </ul>
            </li>
            <li className="nav-item dropdown pe-3">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png" alt="Profile" style={{ height: 25, width: 25, borderRadius: 30 }} />
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/user/">My Profile</a></li>
                <li><a className="dropdown-item" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Logout</a></li>
              </ul>

            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar