import React, { useContext } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt from "jwt-decode";
import { Button, Modal } from "react-bootstrap";

function LoginForm(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();

  const login = async () => {
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
          const token = response.data.data;
          const claims = jwt(token);
          sessionStorage.setItem("token", response.data.data);
          sessionStorage.setItem("roles", claims.group);
          props.handleClose();
          navigate(`/`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Prijavi se</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <label>Username</label>
        <input
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>
        <input
          className="form-control"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button type="submit" onClick={login}>
          Potvrdi
        </Button>
        <Button variant="secondary" onClick={props.handleClose}>
          Odustani
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LoginForm;
