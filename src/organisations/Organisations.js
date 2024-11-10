import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../table/Table";
import ReactPaginate from "react-paginate";

import { hasAdminGroup, PAGE_SIZE } from "../utilis/ServiceUtil";
import OrganisationModal from "./OrganisationModal";
import ConfirmationModal from "../confirmation_modal/ConfirmationModal";
import { toast } from "react-toastify";

function Organisations(props) {
  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // table data
  const theadData = ["Naziv organizacije"];
  const [organisations, setOrganisations] = useState([]);

  // add-modal
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    getOrganisations();
  };
  const handleOpen = () => setShow(true);

  const openAddModal = () => {
    handleOpen();
  };

  const getOrganisations = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/organisations/`, {
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
        getConvertedOrganisations(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getConvertedOrganisations = (unconvertedOrganisations) => {
    let newOrganisations = [];
    unconvertedOrganisations.results.forEach((organisation) => {
      newOrganisations.push(convertToOrganisation(organisation));
    });
    setOrganisations(newOrganisations);
  };

  // formatting table data
  const convertToOrganisation = (organisation) => {
    return {
      id: organisation.id,
      name: organisation.name,
    };
  };

  useEffect(() => {
    getOrganisations();
  }, [currentPage]);

  const handlePaginationChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [organisationToDelete, setOrganisationToDelete] = useState(undefined);

  const deleteOrganisation = (row) => {
    setShowConfirmationModal(true);
    setOrganisationToDelete(row);
  };

  const onConfirmationModalClose = (isConfirmed) => {
    if (isConfirmed) {
      deleteOrganisationRequest(organisationToDelete);
    } else {
      setShowConfirmationModal(false);
    }
  };

  // table functions
  const deleteOrganisationRequest = async (row) => {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}/organisations/${row.id}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setShowConfirmationModal(false);
        setOrganisationToDelete(undefined);
        getOrganisations();
      })
      .catch((error) => {
        if (error.response.status === 409) {
          setShowConfirmationModal(false);
          toast(
            "Organizacija ne može biti izbrisana jer postoje koorinatori, volonteri ili djeca koja su vezana za ovu organizaciju!",
            {
              type: "error",
              position: "top-center",
              autoClose: false,
              hideProgressBar: true,
              className: "toastToFront",
            }
          );
        } else {
          console.log(error);
        }
      });
  };

  const actions = [
    {
      name: "Obriši",
      iconClass: "fas fa-trash redIcon",
      onClick: deleteOrganisation,
      showAction: () => true,
    },
  ];

  if (authenticate && hasAdminGroup(userRoles)) {
    return (
      <div>
        <h1>Organizacije</h1>
        <div className="filterComponentDiv">
          <div></div>
          <button className="btn btn-success" onClick={openAddModal}>
            Dodaj organizaciju
          </button>
        </div>
        <div className="footerDiv">
          <Table header={theadData} data={organisations} actions={actions} />
          <div className="paginationDiv">
            <div></div>
            <ReactPaginate
              className="pagination"
              onPageChange={handlePaginationChange}
              pageCount={totalPages}
              renderOnZeroPageCount={null}
              previousLabel="<"
              nextLabel=">"
            />
          </div>
        </div>
        {show ? (
          <OrganisationModal
            show={show}
            data={undefined}
            handleClose={handleClose}
          />
        ) : null}
        {showConfirmationModal && (
          <ConfirmationModal
            message="Da li ste sigurni da želite izbrisati ovu organizaciju?"
            onModalClose={onConfirmationModalClose}
          />
        )}
      </div>
    );
  }
  return null;
}

export default Organisations;
