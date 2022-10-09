import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt from "jwt-decode";
import { Button, Modal } from "react-bootstrap";
import ResetPasswordForm from "./ResetPasswordForm";
import { validEmailRegex } from "../utilis/ServiceUtil";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import { toast } from "react-toastify";

function LoginForm(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  };

  const [error, setError] = useState(false);

  const [showLoginForm, setShowLoginForm] = useState(true);

  useEffect(() => {
    setShowLoginForm(props.show);
  }, []);

  let navigate = useNavigate();

  // forgot password modal
  const [showForgotPassModal, setShowForgotPassModal] = useState(false);
  const handleForgotPassClose = () => {
    setShowForgotPassModal(false);
    setShowLoginForm(true);
  };
  const handleForgotPassOpen = () => setShowForgotPassModal(true);

  const openForgotPassForm = () => {
    setShowLoginForm(false);
    handleForgotPassOpen();
  };

  const onUsernameChange = (e) => {
    setUsername(e.target.value);
    if (!validEmailRegex.test(e.target.value) && e.target.value !== "") {
      setError(true);
    } else {
      setError(false);
    }
  };

  const login = async () => {
    const id = toast.loading("Prijava...");
    try {
      await axios
        .post(
          "http://localhost:8000/login",
          {
            username,
            password,
          },
          { withCredentials: true }
        )
        .then((response) => {
          toast.dismiss(id);
          const token = response.data.data;
          const claims = jwt(token);
          sessionStorage.setItem("token", response.data.data);
          sessionStorage.setItem("roles", claims.group);
          props.handleClose();
          navigate(`/`);
        });
    } catch (error) {
      toast.update(id, {
        render: "E-Mail ili lozinka nisu ispravni!",
        type: "error",
        isLoading: false,
        autoClose: false,
        closeButton: true,
      });
    }
  };

  return (
    <div>
      <Modal show={showLoginForm} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Prijavi se</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div>
            <label>Email</label>
            <input
              className="form-control "
              type="email"
              value={username}
              onChange={onUsernameChange}
            />
            {error ? (
              <span className="errorMessage">E-Mail nije validan!</span>
            ) : null}
          </div>

          <div>
            <label>Password</label>
            <input
              className="form-control"
              type={passwordType}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="btn btn-outline-primary"
              onClick={togglePassword}
              disabled={!password}
            >
              {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div>
            <button
              className="forgotPasswordButton"
              onClick={openForgotPassForm}
            >
              Zaboravili ste lozinku?
            </button>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="submit"
            onClick={login}
            disabled={!username || !password}
          >
            Potvrdi
          </Button>
          <Button variant="secondary" onClick={props.handleClose}>
            Odustani
          </Button>
        </Modal.Footer>
      </Modal>
      {showForgotPassModal ? (
        <ResetPasswordForm
          show={showForgotPassModal}
          handleClose={handleForgotPassClose}
        />
      ) : null}
    </div>
  );
}

export default LoginForm;
