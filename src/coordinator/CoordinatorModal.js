import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Select from "react-dropdown-select";

import "../coordinator/Coordinator.css";
import { hasAdminGroup, validEmailRegex } from "../utilis/ServiceUtil";

function CoordinatorModal(props) {
  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  const [coordinatorFirstName, setCoordinatorFirstName] = useState("");
  const [coordinatorLastName, setCoordinatorLastame] = useState("");
  const [coordinatorEmail, setCoordinatorEmail] = useState("");

  const [error, setError] = useState(false);

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

    setCoordinatorOrganisation(
      props.organisations.filter(
        (value) => value.name === props.data.organisation
      )
    );

    setCoordinatorCity(
      props.cities.filter((value) => value.name === props.data.city)
    );
  };

  const addCoordinator = async () => {
    await axios
      .post(`${process.env.REACT_APP_API_URL}/coordinators/`, getModalData(), {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => props.handleClose())
      .catch((error) => {
        console.log(error);
      });
  };

  const updateCoordinator = async () => {
    await axios
      .put(
        `${process.env.REACT_APP_API_URL}/coordinators/${props.data.id}/`,
        getModalData(),
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => props.handleClose())
      .catch((error) => {
        console.log(error);
      });
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

  const onEmailChange = (e) => {
    setCoordinatorEmail(e.target.value);
    if (!validEmailRegex.test(e.target.value) && e.target.value !== "") {
      setError(true);
    } else {
      setError(false);
    }
  };

  const disableSubmitButton = () => {
    return (
      error ||
      !coordinatorFirstName ||
      !coordinatorLastName ||
      !coordinatorEmail ||
      !coordinatorOrganisation ||
      coordinatorOrganisation.length == 0 ||
      !coordinatorCity ||
      coordinatorCity.length == 0
    );
  };

  if (authenticate && hasAdminGroup(userRoles)) {
    return (
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          {props.data ? (
            <Modal.Title>Izmijeni koordinatora</Modal.Title>
          ) : (
            <Modal.Title>Dodaj koordinatora</Modal.Title>
          )}
        </Modal.Header>

        <Modal.Body>
          <div className="formDiv">
            <label className="title">Ime</label>
            <input
              type="text"
              value={coordinatorFirstName}
              onChange={(e) => setCoordinatorFirstName(e.target.value)}
            />
          </div>
          <div className="formDiv">
            <label className="title">Prezime</label>
            <input
              type="text"
              value={coordinatorLastName}
              onChange={(e) => setCoordinatorLastame(e.target.value)}
            />
          </div>
          <div className="formDiv">
            <label className="title">Email</label>
            <input
              className={"" + (error ? "invalid-email" : "")}
              type="email"
              placeholder="name@example.com"
              value={coordinatorEmail}
              onChange={onEmailChange}
              disabled={props.data !== undefined}
            />
          </div>
          <div>
            <label className="title">Organizacija</label>
            <Select
              values={coordinatorOrganisation}
              options={props.organisations}
              onChange={(values) => setCoordinatorOrganisation(values)}
              placeholder="Organizacija"
              valueField="name"
              labelField="name"
              disabled={props.data !== undefined}
            />
          </div>
          <div>
            <label className="title">Grad</label>
            <Select
              options={props.cities}
              values={coordinatorCity}
              onChange={(values) => setCoordinatorCity(values)}
              placeholder="Grad"
              valueField="name"
              labelField="name"
              disabled={props.data !== undefined}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          {props.data ? (
            <Button
              type="submit"
              style={{ borderRadius: "0%" }}
              onClick={updateCoordinator}
              disabled={disableSubmitButton()}
            >
              Izmijeni
            </Button>
          ) : (
            <Button
              type="submit"
              style={{ borderRadius: "0%" }}
              onClick={addCoordinator}
              disabled={disableSubmitButton()}
            >
              Potvrdi
            </Button>
          )}
          <Button
            variant="secondary"
            style={{ borderRadius: "0%" }}
            onClick={props.handleClose}
          >
            Zatvori
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  return null;
}

export default CoordinatorModal;
