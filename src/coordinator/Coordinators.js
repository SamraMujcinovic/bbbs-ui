import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../table/Table";
import ReactPaginate from "react-paginate";

import CoordinatorModal from "./CoordinatorModal";
import { hasAdminGroup, PAGE_SIZE } from "../utilis/ServiceUtil";

function Coordinators(props) {
  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // table data
  const theadData = ["Ime", "Prezime", "E-mail", "Organizacija", "Grad"];
  const [coordinators, setCoordinators] = useState([]);
  const [selectedTableRow, setSelectedTableRow] = useState(undefined);

  // send data to modal
  const [organisations, setOrganisations] = useState([]);
  const [cities, setCities] = useState([]);

  const editCoordinator = (row) => {
    setSelectedTableRow(row);
    openAddModal();
  };

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
      .get(`${process.env.REACT_APP_API_URL}/coordinators/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          page: currentPage,
        },
      })
      .then((response) => {
        setTotalElements(response.data.count);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
        getConvertedCoordiantors(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getConvertedCoordiantors = (unConvertedCoordinators) => {
    let newCoordinators = [];
    unConvertedCoordinators.results.forEach((coordinator) => {
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

  useEffect(() => {
    getCoordinators();
    getOrganisations();
    getCities();
  }, []);

  useEffect(() => {
    getCoordinators();
  }, [currentPage]);

  const getOrganisations = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/organisations/`, {
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
      .get(`${process.env.REACT_APP_API_URL}/cities/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => setCities(response.data))
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePaginationChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const actions = [
    {
      name: "Edituj",
      iconClass: "fas fa-pencil-alt orangeIcon",
      onClick: editCoordinator,
      showAction: () => true,
    },
  ];

  if (authenticate && hasAdminGroup(userRoles)) {
    return (
      <div>
        <h1>Koordinatori</h1>
        <button className="btn btn-success" onClick={openAddModal}>
          Dodaj koordinatora
        </button>
        <Table header={theadData} data={coordinators} actions={actions} />
        <div className="paginationDiv">
          <ReactPaginate
            className="pagination"
            onPageChange={handlePaginationChange}
            pageCount={totalPages}
            renderOnZeroPageCount={null}
            previousLabel="<"
            nextLabel=">"
          />
        </div>
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
