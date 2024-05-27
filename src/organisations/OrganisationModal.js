import axios from "axios";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

import "../coordinator/Coordinator.css";
import { hasAdminGroup } from "../utilis/ServiceUtil";

function OrganisationModal(props) {
  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  const [organisationName, setOrganisationName] = useState("");

  const [error, setError] = useState(false);

  const addOrganisation = async () => {
    await axios
      .post(`${process.env.REACT_APP_API_URL}/organisations/`, getModalData(), {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => props.handleClose())
      .catch((error) => {
        console.log(error);
      });
  };

  const getModalData = () => {
    return {
      name: organisationName,
    };
  };

  const disableSubmitButton = () => {
    return error || !organisationName || !organisationName.length;
  };

  if (authenticate && hasAdminGroup(userRoles)) {
    return (
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Dodaj organizaciju</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="formDiv">
            <label className="title">Naziv organizacije</label>
            <input
              type="text"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="submit"
            onClick={addOrganisation}
            disabled={disableSubmitButton()}
          >
            Potvrdi
          </Button>
          <Button variant="secondary" onClick={props.handleClose}>
            Zatvori
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  return null;
}

export default OrganisationModal;
