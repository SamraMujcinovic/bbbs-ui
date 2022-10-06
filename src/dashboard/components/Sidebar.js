import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LoginForm from "../LoginForm";
import axios from "axios";

const Sidebar = ({ children }) => {
  const menuItem = [
    {
      path: "/coordinators",
      name: "Kordinatori",
      roles: ["admin"],
    },
    {
      path: "/volunteers",
      name: "Volonteri",
      roles: ["admin", "coordinator"],
    },
    {
      path: "/childs",
      name: "Djeca",
      roles: ["admin", "coordinator"],
    },
    {
      path: "/forms",
      name: "Forme",
      roles: ["admin", "coordinator", "volunteer"],
    },
  ];

  // navigation
  let navigate = useNavigate();

  const authenticate = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("roles");

  // login-modal
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
  };
  const handleOpen = () => setShow(true);

  const openLoginForm = () => {
    handleOpen();
  };

  const logout = async () => {
    try {
      await axios
        .post(
          "http://localhost:8000/logout",
          {
            all: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        )
        .then(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("roles");
          navigate(`/`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="top_section">
          <h1 style={{ display: "block" }} className="logo">
            BBBS
          </h1>
        </div>
        {menuItem
          .filter((item) => item.roles.includes(userRole))
          .map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              className="link"
              activeclassname="active"
            >
              <div className="icon">{item.icon}</div>
              <div style={{ display: "block" }} className="link_text">
                {item.name}
              </div>
            </NavLink>
          ))}
      </div>
      <div className="sidebarContent">
        <div className="loginButtonDiv">
          {sessionStorage.getItem("token") ? (
            <button className="loginButton" onClick={logout}>
              Logout
            </button>
          ) : (
            <button className="loginButton" onClick={openLoginForm}>
              Login
            </button>
          )}
        </div>
        {show ? <LoginForm show={show} handleClose={handleClose} /> : null}
        {authenticate ? <main>{children}</main> : null}
      </div>
    </div>
  );
};

export default Sidebar;
