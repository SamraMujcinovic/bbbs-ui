import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Select from "react-dropdown-select";

import "../coordinator/Coordinator.css";

function CoordinatorModal(props) {
  const [coordinatorFirstName, setCoordinatorFirstName] = useState("");
  const [coordinatorLastName, setCoordinatorLastame] = useState("");
  const [coordinatorEmail, setCoordinatorEmail] = useState("");

  const [coordinatorOrganisation, setCoordinatorOrganisation] = useState();
  const [coordinatorCity, setCoordinatorCity] = useState();

  useEffect(() => {
    if (props.data) {
      setInitialState();
    }
  }, []);

  const setInitialState = () => {
    setCoordinatorFirstName(props.data.first_name);
    setCoordinatorLastame(props.data.last_name);
    setCoordinatorEmail(props.data.email);
  };

  const getModalData = () => {
    return {
      user: {
        first_name: coordinatorFirstName,
        last_name: coordinatorLastName,
        email: coordinatorEmail,
      },
      coordinator_organisation: coordinatorOrganisation,
      coordinator_city: coordinatorCity,
    };
  };

  const addCoordinator = async () => {
    await axios
      .post("http://localhost:8000/coordinators/", getModalData(), {
        withCredentials: true,
      })
      .then((response) => props.handleClose())
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Dodaj koordinatora</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="formDiv">
          <label>Ime</label>
          <input
            type="text"
            value={coordinatorFirstName}
            onChange={(e) => setCoordinatorFirstName(e.target.value)}
          />
        </div>
        <div className="formDiv">
          <label>Prezime</label>
          <input
            type="text"
            value={coordinatorLastName}
            onChange={(e) => setCoordinatorLastame(e.target.value)}
          />
        </div>
        <div className="formDiv">
          <label>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={coordinatorEmail}
            onChange={(e) => setCoordinatorEmail(e.target.value)}
          />
        </div>
        <Select
          values={coordinatorOrganisation}
          options={props.organisations}
          onChange={(values) => setCoordinatorOrganisation(values)}
          placeholder="Organizacija"
          valueField="name"
          labelField="name"
        />
        <Select
          options={props.cities}
          values={coordinatorCity}
          onChange={(values) => setCoordinatorCity(values)}
          placeholder="Grad"
          valueField="name"
          labelField="name"
        />
      </Modal.Body>

      <Modal.Footer>
        <Button type="submit" onClick={addCoordinator}>
          Submit
        </Button>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CoordinatorModal;
