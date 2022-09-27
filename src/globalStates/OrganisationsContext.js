import React from "react";

let OrganisationsContext = React.createContext(null);

const getOrganisations = async () => {
  await axios
    .get("http://localhost:8000/organisations/", { withCredentials: true })
    .then(
      (response) => (OrganisationsContext = React.createContext(response.data))
    )
    .catch((error) => {
      console.log(error);
      setAuthenticate(false);
      navigate(`/login`);
    });
};

export { OrganisationsContext };
