import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ children }) => {
  const menuItem = [
    {
      path: "/coordinators",
      name: "Kordinatori",
    },
    {
      path: "/volunteers",
      name: "Volonteri",
    },
    {
      path: "/childs",
      name: "Djeca",
    },
    {
      path: "/forms",
      name: "Forme",
    },
  ];

  return (
    <div className="container">
      <div className="sidebar">
        <div className="top_section">
          <h1 style={{ display: "block" }} className="logo">
            Logo
          </h1>
        </div>
        {menuItem.map((item, index) => (
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
      <main>{children}</main>
    </div>
  );
};

export default Sidebar;
