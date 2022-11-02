import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import LoginForm from "../LoginForm";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ChangePasswordForm from "../ChangePasswordForm";
import { logout } from "../LogoutAPI";

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

  const authenticate = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("roles");
  const user = sessionStorage.getItem("user");

  // login-modal
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
  };
  const handleOpen = () => setShow(true);

  const openLoginForm = () => {
    handleOpen();
  };

  // change password modal
  const [settingsOpened, setSettingsOpened] = useState(false);

  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const handleChangePassClose = () => {
    setShowChangePassModal(false);
  };
  const handleChangePassOpen = () => setShowChangePassModal(true);

  const openChangePassForm = () => {
    handleChangePassOpen();
  };

  return (
    <div className="sidebarContainerDiv">
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
            <div className="logoutButtonDiv">
              <div className="usernameDiv">
                {settingsOpened ? (
                  <button onClick={() => setSettingsOpened(false)}>
                    {user}
                    <FaChevronUp className="settingsIcon" />
                  </button>
                ) : (
                  <button onClick={() => setSettingsOpened(true)}>
                    {user}
                    <FaChevronDown className="settingsIcon" />
                  </button>
                )}
              </div>
              {settingsOpened ? (
                <div className="settingsDiv">
                  <button onClick={logout}>Odjavi se</button>
                  <button onClick={openChangePassForm}>
                    Promijeni lozinku
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button className="loginButton" onClick={openLoginForm}>
              Prijavi se
            </button>
          )}
        </div>
        {show ? <LoginForm show={show} handleClose={handleClose} /> : null}
        {showChangePassModal ? (
          <ChangePasswordForm
            show={showChangePassModal}
            handleClose={handleChangePassClose}
          />
        ) : null}
        {authenticate ? <main>{children}</main> : null}
      </div>
    </div>
  );
};

export default Sidebar;
