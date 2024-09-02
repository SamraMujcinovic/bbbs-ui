import axios from "axios";
import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { logout } from "../dashboard/LogoutAPI";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ChangePasswordForm(props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const [responseError, setResponseError] = useState(false);

  const [oldPasswordType, setOldPasswordType] = useState("password");
  const toggleOldPassword = () => {
    if (oldPasswordType === "password") {
      setOldPasswordType("text");
      return;
    }
    setOldPasswordType("password");
  };

  const [newPasswordType, setNewPasswordType] = useState("password");
  const toggleNewPassword = () => {
    if (newPasswordType === "password") {
      setNewPasswordType("text");
      return;
    }
    setNewPasswordType("password");
  };

  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const toggleConfirmPassword = () => {
    if (confirmPasswordType === "password") {
      setConfirmPasswordType("text");
      return;
    }
    setConfirmPasswordType("password");
  };

  const onNewPasswordChange = (e) => {
    setConfirmPassword("");
    setNewPassword(e.target.value);
  };

  const onConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== newPassword) {
      setConfirmPasswordError(true);
    } else {
      setConfirmPasswordError(false);
    }
  };

  const onOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
    setResponseError(false);
  };

  const changePassword = async () => {
    const id = toast.loading("Promjena lozinke...");
    await axios
      .post(
        `${process.env.REACT_APP_API_URL}/password`,
        {
          newPassword,
          oldPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        toast.update(id, {
          render: "Lozinka je uspješno promijenjena!",
          type: "success",
          isLoading: false,
          autoClose: false,
          closeButton: true,
        });
        logout();
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
          <Modal.Title>Promijeni lozinku</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="passwordDiv">
            <label>Stara lozinka</label>
            <input
              className="form-control "
              type={oldPasswordType}
              value={oldPassword}
              onChange={onOldPasswordChange}
            />
            <button
              className="btn btn-outline-primary togglePasswordButton"
              onClick={toggleOldPassword}
              disabled={!oldPassword}
            >
              {oldPasswordType === "password" ? <FaEye /> : <FaEyeSlash />}
            </button>
            {responseError && (
              <span className="response-error">
                Stara lozinka nije ispravna!
              </span>
            )}
          </div>

          <div className="passwordDiv">
            <label>Nova lozinka</label>
            <input
              className="form-control "
              type={newPasswordType}
              value={newPassword}
              onChange={onNewPasswordChange}
            />
            <button
              className="btn btn-outline-primary togglePasswordButton"
              onClick={toggleNewPassword}
              disabled={!newPassword}
            >
              {newPasswordType === "password" ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div className="passwordDiv">
            <label>Ponovi lozinku</label>
            <input
              className="form-control "
              type={confirmPasswordType}
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
            />
            {confirmPasswordError ? (
              <span className="errorMessage">Nije ista kao nova lozinka!</span>
            ) : null}
            <button
              className="btn btn-outline-primary togglePasswordButton"
              onClick={toggleConfirmPassword}
              disabled={!confirmPassword}
            >
              {confirmPasswordType === "password" ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            onClick={changePassword}
            disabled={
              !oldPassword ||
              !newPassword ||
              !confirmPassword ||
              confirmPasswordError
            }
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

export default ChangePasswordForm;
