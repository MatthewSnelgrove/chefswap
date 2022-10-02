import React from 'react';
import "./styles/Modal.scss";

/**
 * Popup component container
 * @param children JSX children elements
 * @param {String} title Title of modal to be displayed
 */
function Modal({ children, title = "Chefswap", backgroundUrl }) {
  // console.log(`rgba(128, 128, 128, 0.701), ${backgroundUrl}`);    // test
  return (
    <div className="cred-modal-container" style={{ backgroundImage: `linear-gradient(rgba(128, 128, 128, 0.3), rgba(128, 128, 128, 0.3)), url(${backgroundUrl})` }}>

      <div className="popup">
        <div className="cred-modal-header">
          <div className="header-title">{title}</div>
          <button className="close-modal-btn">
            <span className="material-symbols-rounded">
              close
            </span>
          </button>
        </div>
        <div className="cred-modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal