import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuthenticated } from "../globalStates/AuthenticateContext";

function MainPage(props) {
  let navigate = useNavigate();

  const [authenticate, setAuthenticate] = useContext(UserAuthenticated);

  return (
    <div>
      <h3>This is main page!</h3>
    </div>
  );
}

export default MainPage;
