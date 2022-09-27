import React from "react";

export function hasAdminGroup(userGroups) {
  return userGroups.some((group) => group === "admin");
}

export function hasCoordinatorGroup(userGroups) {
  return userGroups.some((group) => group === "coordinator");
}

export function hasVolunteerGroup(userGroups) {
  console.log(userGroups);
  return userGroups.some((group) => group === "volunteer");
}
