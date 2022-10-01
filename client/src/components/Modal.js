import React from 'react';
import "./styles/Modal.scss";

/**
 * Popup component container
 * @param children JSX children elements
 * @param {String} title Title of modal to be displayed
 */
function Modal({ children, title = "Chefswap" }) {
  return (
    <div className="cred-modal-container">

      <div className="popup">
        <div className="cred-modal-header">
          <div className="header-title">{title}</div>
          <button className="close-modal-btn">
            <span class="material-symbols-rounded">
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