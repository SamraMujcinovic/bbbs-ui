import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt from "jwt-decode";
import ResetPasswordForm from "../dashboard/ResetPasswordForm";
import { validEmailRegex } from "../utilis/ServiceUtil";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import "./LoginPage.css";

function LoginPage(props) {
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
  const [responseError, setResponseError] = useState(false);

  useEffect(() => {}, []);

  let navigate = useNavigate();

  // forgot password modal
  const [showForgotPassModal, setShowForgotPassModal] = useState(false);
  const handleForgotPassClose = () => {
    setShowForgotPassModal(false);
  };
  const handleForgotPassOpen = () => setShowForgotPassModal(true);

  const openForgotPassForm = () => {
    handleForgotPassOpen();
  };

  const onUsernameChange = (e) => {
    setUsername(e.target.value);
    setResponseError(false);
    if (!validEmailRegex.test(e.target.value) && e.target.value !== "") {
      setError(true);
    } else {
      setError(false);
    }
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    setResponseError(false);
  };

  const login = async () => {
    try {
      await axios
        .post(
          `${process.env.REACT_APP_API_URL}/login`,
          {
            username,
            password,
          },
          { withCredentials: true }
        )
        .then((response) => {
          const token = response.data.data;
          const claims = jwt(token);
          const user = "" + claims.first_name + " " + claims.last_name;
          sessionStorage.setItem("token", response.data.data);
          sessionStorage.setItem("roles", claims.group);
          sessionStorage.setItem("user", user);
          navigate("/");
        });
    } catch (error) {
      setResponseError(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src={require("../images/logo.png")}
          alt="Logo"
          className="login-logo"
        />
        <h1>Prijavi se</h1>
        <div className="login-inputs">
          <div className="emailDiv">
            <label>Email</label>
            <input
              className={"form-control " + (error ? "invalid-email" : "")}
              type="email"
              value={username}
              onChange={onUsernameChange}
            />
          </div>

          <div className="passwordDiv">
            <label>Lozinka</label>
            <input
              className="form-control"
              type={passwordType}
              value={password}
              onChange={onPasswordChange}
            />
            <button
              className="btn btn-outline-primary togglePasswordButton"
              onClick={togglePassword}
              disabled={!password}
            >
              {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
            </button>
            {responseError && (
              <span className="response-error">
                E-Mail ili lozinka nisu ispravni!
              </span>
            )}
          </div>

          <div className="forgotPasswordButtonDiv">
            <button
              className="forgotPasswordButton"
              onClick={openForgotPassForm}
            >
              Zaboravili ste lozinku?
            </button>
          </div>

          <div>
            <button
              className="login-button"
              onClick={login}
              disabled={!username || !password}
            >
              Prijavi se
            </button>
          </div>
        </div>

        {showForgotPassModal ? (
          <ResetPasswordForm
            show={showForgotPassModal}
            handleClose={handleForgotPassClose}
          />
        ) : null}
      </div>
    </div>
  );
}

export default LoginPage;
