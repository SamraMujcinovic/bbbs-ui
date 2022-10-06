import React from "react";

export function hasAdminGroup(userGroups) {
  return userGroups === "admin";
}

export function hasCoordinatorGroup(userGroups) {
  return userGroups === "coordinator";
}

export function hasVolunteerGroup(userGroups) {
  return userGroups === "volunteer";
}
