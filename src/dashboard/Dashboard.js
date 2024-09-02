import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ChangePasswordForm from "./ChangePasswordForm";
import { logout } from "./LogoutAPI";

const Dashboard = () => {
  const user = sessionStorage.getItem("user");

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
    <div className="dashboard">
      <Sidebar />
      <div className="content">
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
              <button onClick={openChangePassForm}>Promijeni lozinku</button>
            </div>
          ) : null}
        </div>
        {showChangePassModal ? (
          <ChangePasswordForm
            show={showChangePassModal}
            handleClose={handleChangePassClose}
          />
        ) : null}
        <div className="main">
          <Outlet />
        </div>
        {/* This is where the routed pages will be rendered */}
      </div>
    </div>
  );
};

export default Dashboard;
