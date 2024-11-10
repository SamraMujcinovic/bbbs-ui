import React from "react";
import "./ConfirmationModal.css";

const ConfirmationModal = ({ message, onModalClose }) => {
  return (
    <div className="modal-overlay">
      <div className="confirmationModal">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={() => onModalClose(true)}>
            Obriši
          </button>
          <button className="cancel-btn" onClick={() => onModalClose(false)}>
            Odustani
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
