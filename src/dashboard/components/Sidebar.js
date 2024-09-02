import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItem = [
    {
      path: "/organisations",
      name: "Organizacije",
      roles: ["admin"],
    },
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
    {
      path: "/hours",
      name: "Sati",
      roles: ["admin", "coordinator", "volunteer"],
    },
  ];

  const userRole = sessionStorage.getItem("roles");

  return (
    <div className="sidebar">
      <div className="logo">
        <div>
          <img src={require("../../images/logo.png")} />
        </div>
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
  );
};

export default Sidebar;
