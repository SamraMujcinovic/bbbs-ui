import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuthenticated } from "../globalStates/AuthenticateContext";

function MainPage(props) {
  let navigate = useNavigate();

  const [authenticate, setAuthenticate] = useContext(UserAuthenticated);

  const navigateToLogin = () => {
    let path = `login`;
    navigate(path);
  };

  return (
    <div>
      <h3>This is main page!</h3>

      <button onClick={navigateToLogin}>Login</button>
    </div>
  );
}

export default MainPage;
