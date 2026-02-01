import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";

import { hasVolunteerGroup } from "../../utilis/ServiceUtil";

function BillModal(props) {
  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  const [place, setPlace] = useState("");
  const [amount, setAmount] = useState(0.0);

  const [error, setError] = useState(false);

  const handleAmountChange = (e) => {
    let value = e.target.value;

    // allow numbers, dot and comma
    const regex = /^[0-9.,]*$/;

    if (!regex.test(value)) {
      setError(true);
      setAmount(value);
      return;
    }

    setError(false);
    setAmount(value);
  };

  const normalizeAmount = (val) => {
    return parseFloat(val.replace(",", "."));
  };

  const addBill = () => {
    props.onSave({
      place: place,
      amount: normalizeAmount(amount),
    });

    // reset polja
    setPlace("");
    setAmount("");

    props.handleClose();
  };

  const disableSubmitButton = () => {
    return error || !place || !amount || amount == 0;
  };

  if (authenticate && hasVolunteerGroup(userRoles)) {
    return (
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Dodaj račun</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="formDiv">
            <label className="title">Mjesto</label>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
          </div>
          <div className="formDiv">
            <label className="title">Iznos računa (KM)</label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              style={{
                border: error ? "2px solid #d32f2f" : "1px solid #ccc",
                backgroundColor: error ? "#ffe6e6" : "white",
              }}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="submit"
            style={{ borderRadius: "0%" }}
            onClick={addBill}
            disabled={disableSubmitButton()}
          >
            Dodaj
          </Button>

          <Button
            variant="secondary"
            style={{ borderRadius: "0%" }}
            onClick={props.handleClose}
          >
            Zatvori
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  return null;
}

export default BillModal;
