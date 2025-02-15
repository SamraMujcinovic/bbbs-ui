import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";
import {
  hasVolunteerGroup,
  hasCoordinatorGroup,
  hasAdminGroup,
  PAGE_SIZE,
} from "../utilis/ServiceUtil";

import ReactPaginate from "react-paginate";

import FilterComponent from "../filter/FilterComponent";

import ConfirmationModal from "../confirmation_modal/ConfirmationModal";
import { toast } from "react-toastify";

function Volunteer(props) {
  // navigation
  let navigate = useNavigate();

  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // table data
  const theadData = ["Ime", "Prezime", "E-mail", "Organizacija", "Grad"];
  const [volunteers, setVolunteers] = useState([]);

  const [organisations, setOrganisations] = useState([]);

  const filters = {
    showOrganisationFilter: true,
    showVolunteerFilter: false,
    showActivityTypeFilter: false,
    showDateFilter: false,
  };
  const [selectedFilters, setSelectedFilters] = useState({});

  const editVolunteeer = (row) => {
    navigateToVolunteerDetails(row);
  };

  useEffect(() => {
    getAccessibleOrganisations();
    getVolunteers();
  }, []);

  useEffect(() => {
    getVolunteers();
  }, [currentPage, selectedFilters]);

  // add volunteer page
  const openAddVolunteerPage = () => {
    navigateToVolunteerDetails(undefined);
  };

  const navigateToVolunteerDetails = (selectedVolunteer) => {
    let path = `details`;
    navigate(path, {
      state: {
        selectedVolunteer: selectedVolunteer,
        isEditMode: selectedVolunteer !== undefined,
      },
    });
  };

  // formatting table data
  const covertToVolunteerData = (volunteer) => {
    return {
      id: volunteer.id,
      first_name: volunteer.user.first_name,
      last_name: volunteer.user.last_name,
      email: volunteer.user.email,
      organisation: volunteer.volunteer_organisation[0].name,
      city: volunteer.volunteer_city[0].name,
    };
  };

  const getConvertedVolunteers = (unConvertedVolunteers) => {
    let newVolunteers = [];
    unConvertedVolunteers.results.forEach((volunteer) => {
      newVolunteers.push(covertToVolunteerData(volunteer));
    });
    setVolunteers(newVolunteers);
  };

  const searchClicked = async (filters) => {
    setCurrentPage(1);
    setSelectedFilters(filters);
  };

  const getVolunteers = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          organisationFilter:
            selectedFilters?.organisationFilter === ""
              ? undefined
              : selectedFilters?.organisationFilter,
          page: currentPage,
        },
      })
      .then((response) => {
        setTotalElements(response.data.count);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
        getConvertedVolunteers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePaginationChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const getAccessibleOrganisations = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/organisations/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => setOrganisations(response.data.results))
      .catch((error) => {
        console.log(error);
      });
  };

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState(undefined);

  const deleteVolunteer = (row) => {
    setShowConfirmationModal(true);
    setVolunteerToDelete(row);
  };

  const onConfirmationModalClose = (isConfirmed) => {
    if (isConfirmed) {
      deleteVolunteerRequest(volunteerToDelete);
    } else {
      setShowConfirmationModal(false);
    }
  };

  // table functions
  const deleteVolunteerRequest = async (row) => {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}/volunteers/${row.id}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setShowConfirmationModal(false);
        setVolunteerToDelete(undefined);
        getVolunteers();
      })
      .catch((error) => {
        if (error.response.status === 409) {
          setShowConfirmationModal(false);
          toast(
            "Volonter ne može biti izbrisan jer postoje forme druženja ili dijete koje je vezano za ovog volontera!",
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

  const downloadExcelFile = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/download`, {
        params: {
          organisationFilter:
            selectedFilters?.organisationFilter === ""
              ? undefined
              : selectedFilters?.organisationFilter,
        },
        responseType: "blob", // To handle the file response correctly
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        // Get the filename from the response headers
        const contentDisposition = response.headers["content-disposition"];
        const matches =
          contentDisposition && contentDisposition.match(/filename="(.+)"/);
        const filename =
          matches && matches[1] ? matches[1] : "default_filename.xlsx"; // Fallback if no filename

        // Create a link to trigger the download
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }); // Excel MIME type
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename; // Use the filename from the server
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading the file:", error);
      });
  };

  const actions = [
    {
      name: "Edituj",
      iconClass: "fas fa-pencil-alt orangeIcon",
      onClick: editVolunteeer,
      showAction: () => true,
    },
    {
      name: "Obriši",
      iconClass: "fas fa-trash redIcon",
      onClick: deleteVolunteer,
      showAction: () => true,
    },
  ];

  if (authenticate && !hasVolunteerGroup(userRoles)) {
    return (
      <div>
        <h1>Volonteri</h1>
        <div className="filterComponentDiv">
          <FilterComponent
            filters={filters}
            organisationList={organisations}
            onSearch={searchClicked}
          />
          <div className="volunteer-filter-buttons">
            <button className="btn btn-success" onClick={openAddVolunteerPage}>
              Dodaj volontera
            </button>
            {hasAdminGroup(userRoles) || hasCoordinatorGroup(userRoles) ? (
              <button
                className="excel-button"
                title="Generiši excel dokument"
                onClick={downloadExcelFile}
              >
                <i className="fas fa-file-excel"></i>
              </button>
            ) : null}
          </div>
        </div>
        <div className="footerDiv">
          <Table header={theadData} data={volunteers} actions={actions} />
          <div className="paginationDiv">
            <div></div>
            <ReactPaginate
              className="pagination"
              onPageChange={handlePaginationChange}
              pageCount={totalPages}
              renderOnZeroPageCount={null}
              previousLabel="<"
              nextLabel=">"
              forcePage={currentPage - 1}
            />
          </div>
        </div>
        {showConfirmationModal && (
          <ConfirmationModal
            message="Da li ste sigurni da želite izbrisati ovog volontera?"
            onModalClose={onConfirmationModalClose}
          />
        )}
      </div>
    );
  }
  return null;
}

export default Volunteer;
