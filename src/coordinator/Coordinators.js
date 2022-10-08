import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../table/Table";
import CoordinatorModal from "./CoordinatorModal";
import { hasAdminGroup } from "../utilis/ServiceUtil";

function Coordinators(props) {
  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

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
      .get("http://localhost:8000/coordinators/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => getConvertedCoordiantors(response))
      .catch((error) => {
        console.log(error);
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
      .get("http://localhost:8000/organisations/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => setOrganisations(response.data))
      .catch((error) => {
        console.log(error);
      });
  };

  const getCities = async () => {
    await axios
      .get("http://localhost:8000/cities/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => setCities(response.data))
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getCoordinators();
    getOrganisations();
    getCities();
  }, []);

  if (authenticate && hasAdminGroup(userRoles)) {
    return (
      <div>
        <h1>Koordinatori</h1>
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
  return null;
}

export default Coordinators;
