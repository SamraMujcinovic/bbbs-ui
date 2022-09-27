import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Table from "../table/Table";
import CoordinatorModal from "./CoordinatorModal";
import { UserAuthenticated } from "../globalStates/AuthenticateContext";

function Coordinators(props) {
  // navigation
  let navigate = useNavigate();

  // authenticate
  const [authenticate, setAuthenticate] = useContext(UserAuthenticated);

  // table data
  const theadData = ["Ime", "Prezime", "E-mail", "Organizacija", "Grad", ""];
  const [coordinators, setCoordinators] = useState([]);
  const [selectedTableRow, setSelectedTableRow] = useState(undefined);

  const getSelectedRow = (row) => {
    setSelectedTableRow(row);
    openAddModal();
  };

  const [organisations, setOrganisations] = useState([]);
  const [cities, setCities] = useState([]);

  // add-modal
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    getCoordinators();
    setSelectedTableRow(undefined);
  };
  const handleOpen = () => setShow(true);

  const openAddModal = () => {
    handleOpen();
  };

  const getCoordinators = async () => {
    await axios
      .get("http://localhost:8000/coordinators/", { withCredentials: true })
      .then((response) => getConvertedCoordiantors(response))
      .catch((error) => {
        console.log(error);
        setAuthenticate(false);
        navigate(`/login`);
      });
  };

  const getConvertedCoordiantors = (unConvertedCoordinators) => {
    let newCoordinators = [];
    unConvertedCoordinators.data.forEach((coordinator) => {
      newCoordinators.push(covertToCoordinatorData(coordinator));
    });
    setCoordinators(newCoordinators);
  };

  // formatting table data
  const covertToCoordinatorData = (coordinator) => {
    return {
      id: coordinator.id,
      first_name: coordinator.user.first_name,
      last_name: coordinator.user.last_name,
      email: coordinator.user.email,
      organisation: coordinator.coordinator_organisation[0].name,
      city: coordinator.coordinator_city[0].name,
    };
  };

  const getOrganisations = async () => {
    await axios
      .get("http://localhost:8000/organisations/", { withCredentials: true })
      .then((response) => setOrganisations(response.data))
      .catch((error) => {
        console.log(error);
        setAuthenticate(false);
        navigate(`/login`);
      });
  };

  const getCities = async () => {
    await axios
      .get("http://localhost:8000/cities/", { withCredentials: true })
      .then((response) => setCities(response.data))
      .catch((error) => {
        console.log(error);
        setAuthenticate(false);
        navigate(`/login`);
      });
  };

  useEffect(() => {
    getCoordinators();
    getOrganisations();
    getCities();
  }, []);

  // napraviti filter komponentu iz koje cu citati selected values i slati  u ovu komponentu kao props
  // ali kako znati na kojem page-u koje filtere da stavim a koje ne?
  // mozda preko trenutne rute.. hmm
  // ili organizaicije i koordinatore drzati u jednoj filter komponenti a ostale dodavati posebno na page-u
  // ali to sve moze kasnije.. ne trebaju mi ti filteri sada uopce, bitnije je ovo ostalo !!
  // sljedeci page je volonter - prikaz u tabeli, prikaz detalja o volonteru i njegovih formi, create i update
  // onda child page - prikaz utabeli, prikaz detalja o djetetu u modalu, create i update

  // BITNOOOOOOOOOO
  // uradjen je double click na red, ali !!!!
  // za koordinatora ne treba double click na red jer on ima vec sve informacije u tabeli!!
  // jedino ako bi se radio neki edit za koordinatore!

  return (
    <div>
      This is coordinator page!
      <button className="btn btn-success" onClick={openAddModal}>
        Dodaj koordinatora
      </button>
      <Table
        theadData={theadData}
        tbodyData={coordinators}
        getRowData={getSelectedRow}
      />
      {show ? (
        <CoordinatorModal
          show={show}
          data={selectedTableRow}
          handleClose={handleClose}
          organisations={organisations}
          cities={cities}
        />
      ) : null}
    </div>
  );
}

export default Coordinators;
