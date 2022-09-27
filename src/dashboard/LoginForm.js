import React, { useContext } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt from "jwt-decode";

import { UserAuthenticated } from "../globalStates/AuthenticateContext";
import { UserGroups } from "../globalStates/UserGroups";

function LoginForm(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();

  const [authenticate, setAuthenticate] = useContext(UserAuthenticated);
  const [userGroups, setUserGroups] = useContext(UserGroups);

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
          setAuthenticate(true);
          const token = response.data.data.access;
          const claims = jwt(token);
          console.log(claims.group);
          setUserGroups(claims.group);
          navigate(`/`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
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
      <br />
      <button className="btn btn-primary" onClick={login}>
        Login
      </button>
    </div>
  );
}

export default LoginForm;
