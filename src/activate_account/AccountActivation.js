import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "react-bootstrap";

import "../activate_account/ActivateAccount.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AccountActivation = ({ isFirstLogin = false }) => {
  const { uid, token } = useParams(); // Extract the parameters from the URL
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    const id = toast.loading(
      isFirstLogin ? "Aktivacija..." : "Oporavak lozinke..."
    );
    const apiUrl = isFirstLogin
      ? `${process.env.REACT_APP_API_URL}/login/activate/`
      : `${process.env.REACT_APP_API_URL}/password/reset/confirm`;
    const successMessage = isFirstLogin
      ? "Vaš nalog je aktiviran! Sada se možete prijaviti."
      : "Vaša šifra je uspješno promijenjena! Sada se možete prijaviti.";

    await axios
      .post(apiUrl, { uid, token, password })
      .then(() => {
        toast.update(id, {
          render: successMessage,
          type: "success",
          isLoading: false,
          autoClose: false,
          closeButton: true,
        });
        navigate("/"); // Redirect to the main page
      })
      .catch(() => {
        toast.dismiss(id);
        const errorMessage = isFirstLogin
          ? "Postavljanje šifre nije uspjelo. Molimo kontaktirajte odgovornu osobu za detalje."
          : "Promjena šifre nije uspjela. Molimo kontaktirajte odgovornu osobu za detalje.";

        setError(errorMessage);
      });
  };

  return (
    <div className="mainDiv">
      <h1>Dobrodosli u organizaciju 'Stariji brat, starija sestra'</h1>
      <p>
        U polje ispod unesite šifru koju ćete koristiti za pristup aplikaciji.
      </p>
      <div className="formDiv">
        <div className="passwordDiv">
          <label>Lozinka</label>
          <input
            className="form-control"
            type={passwordType}
            value={password}
            onChange={onPasswordChange}
          />
          <button
            className="btn btn-outline-primary"
            onClick={togglePassword}
            disabled={!password}
          >
            {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        <Button
          className="submitButton"
          type="submit"
          style={{ borderRadius: "0%" }}
          onClick={handleSubmit}
          disabled={!password}
        >
          Postavi lozinku
        </Button>
        {error && <p style={{ marginTop: "10px", color: "red" }}>{error}</p>}{" "}
      </div>
    </div>
  );
};

export default AccountActivation;
