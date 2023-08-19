import axios from "axios";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validEmailRegex } from "../utilis/ServiceUtil";

function ResetPasswordForm(props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [responseError, setResponseError] = useState(false);

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    setResponseError(false);
    if (!validEmailRegex.test(e.target.value) && e.target.value !== "") {
      setError(true);
    } else {
      setError(false);
    }
  };

  const resetPassword = async () => {
    const id = toast.loading("Reseting password...");
    await axios
      .post(`${process.env.REACT_APP_API_URL}/password/reset`, {
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
        toast.dismiss(id);
        setResponseError(true);
      });
  };

  return (
    <div>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Resetuj šifru</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <label>Email</label>
          <input
            className={"" + (error ? "invalid-email" : "")}
            type="email"
            value={email}
            onChange={onEmailChange}
          />
          {responseError && (
            <span className="response-error">
              Korisnik sa unesenim e-mailom ne postoji!
            </span>
          )}
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
