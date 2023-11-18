import { React } from "react";
import { signoutUser } from "../utils/changeFunctions";
import Logo from "./Homepage/Logo";
import StyledBtn from "./Homepage/StyledBtn";
import styles from "./styles/Navbar.module.scss";
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";
import global_vars from "../utils/config.js";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Navbar() {
  const user = useUser();
  const globalVars = global_vars;
  if (user === globalVars.userStates.loading) {
    return <></>;
  }

  return <>{user != null ? <LoggedIn user={user} /> : <LoggedOut />}</>;
}

function LoggedIn(props) {
  const user = props.user;
  const pathname = usePathname();

  return (
    <nav
      className={`navbar navbar-expand-sm navbar-fixed ${styles.navbar_fixed}`}
    >
      <div className="container-fluid">
        <div className="navbar-brand">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <div
                className={`nav-link ${
                  pathname.includes("/my-swaps")
                    ? styles.current_nav_link
                    : styles.nav_link
                }`}
              >
                <Link href="/my-swaps">My Swaps</Link>
              </div>
            </li>
            <li className="nav-item">
              <div
                className={`nav-link ${
                  pathname.includes("/find-swap")
                    ? styles.current_nav_link
                    : styles.nav_link
                }`}
              >
                <Link href="/find-swap">Find a Swap</Link>
              </div>
            </li>
            <li className="nav-item">
              <div
                className={`nav-link ${
                  pathname.includes("/my-messages")
                    ? styles.current_nav_link
                    : styles.nav_link
                }`}
              >
                <Link href="/my-messages">Messages</Link>
              </div>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto pe-3">
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle ${styles.nav_link}`}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Learn More
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link href="/about">
                    <div className="dropdown-item">About Chefswap</div>
                  </Link>
                </li>
                <li>
                  <Link href="/about-us">
                    <div className="dropdown-item">About Us</div>
                  </Link>
                </li>
                <li>
                  <Link href="/help">
                    <div className="dropdown-item">Help</div>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown pe-3">
              <a
                className={`nav-link dropdown-toggle ${styles.nav_link}`}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <ProfilePicture
                  pfpLink={user.pfpLink}
                  class={styles.profile_picture_nav}
                />
                {/* <img src={user.pfpLink} style={{ height: 25, width: 25, borderRadius: 30 }} /> */}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link href={"/u/".concat(user.username)}>
                    <div className="dropdown-item">My Profile</div>
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={signoutUser}>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function LoggedOut() {
  return (
    <nav
      className={`navbar navbar-expand-sm navbar-fixed ${styles.navbar_fixed}`}
    >
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <Logo />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto navbar-list-btns">
            <li className="nav-item" style={{ marginRight: "20px" }}>
              <div className={`nav-link ${styles.nav_link}`}>
                <StyledBtn text="ABOUT" color="rgb(0, 0, 80)" link="/about" />
              </div>
            </li>
            <li className="nav-item">
              <div className={`nav-link ${styles.nav_link}`}>
                <StyledBtn text="LOGIN" light color="#ff8c00cb" link="/login" />
              </div>
            </li>
            <li className="nav-item">
              <div className={`nav-link ${styles.nav_link}`}>
                <StyledBtn text="SIGNUP" arrowed link="/signup" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
