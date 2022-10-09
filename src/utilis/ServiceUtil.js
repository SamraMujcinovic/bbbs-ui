export function hasAdminGroup(userGroups) {
  return userGroups === "admin";
}

export function hasCoordinatorGroup(userGroups) {
  return userGroups === "coordinator";
}

export function hasVolunteerGroup(userGroups) {
  return userGroups === "volunteer";
}

export const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);
