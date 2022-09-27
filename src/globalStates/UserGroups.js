import React from "react";

const UserGroups = React.createContext({
  userGroups: [],
  setUserGroups: (state) => {},
});

export { UserGroups };
