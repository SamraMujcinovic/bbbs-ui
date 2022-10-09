import axios from "axios";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validEmailRegex } from "../utilis/ServiceUtil";

function ResetPasswordForm(props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if (!validEmailRegex.test(e.target.value) && e.target.value !== "") {
      setError(true);
    } else {
      setError(false);
    }
  };

  const resetPassword = async () => {
    const id = toast.loading("Reseting password...");
    await axios
      .post("http://localhost:8000/password/reset", {
        email,
      })
      .then(() => {
        toast.update(id, {
          render: "Nova lozinka je poslana na Vaš E-Mail!",
          type: "success",
          isLoading: false,
          autoClose: false,
          closeButton: true,
        });
      })
      .catch(() => {
        toast.update(id, {
          render: "Korisnik sa unesenim e-mailom ne postoji!",
          type: "error",
          isLoading: false,
          autoClose: false,
          closeButton: true,
        });
      });
  };

  return (
    <div>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reset password</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <label>Email</label>
          <input
            className="form-control "
            type="email"
            value={email}
            onChange={onEmailChange}
          />
          {error ? (
            <span className="errorMessage">E-Mail nije validan!</span>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            onClick={resetPassword}
            disabled={!email || error}
          >
            Potvrdi
          </Button>
          <Button variant="secondary" onClick={props.handleClose}>
            Odustani
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ResetPasswordForm;
