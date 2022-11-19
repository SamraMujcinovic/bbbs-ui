export const PAGE_SIZE = 15;

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

export const phoneNumberRegex = RegExp("^0[0-9]{8,9}$");

export function countWords(text) {
  text = text.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
  text = text.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
  text = text.replace(/\n /, "\n"); // exclude newline with a start spacing
  return text.split(" ").filter(function (str) {
    return str !== "";
  }).length;
  //return s.split(' ').filter(String).length; - this can also be used
}
