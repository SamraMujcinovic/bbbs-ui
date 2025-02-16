import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";
import {
  hasVolunteerGroup,
  hasAdminGroup,
  hasCoordinatorGroup,
  PAGE_SIZE,
} from "../utilis/ServiceUtil";

import "../table/Pagination.css";

import FilterComponent from "../filter/FilterComponent";

import ReactPaginate from "react-paginate";

import ConfirmationModal from "../confirmation_modal/ConfirmationModal";
import { toast } from "react-toastify";

function Child(props) {
  // navigation
  let navigate = useNavigate();

  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [organisations, setOrganisations] = useState([]);

  const filters = {
    showOrganisationFilter: true,
    showVolunteerFilter: false,
    showActivityTypeFilter: false,
    showDateFilter: false,
  };
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    getAccessibleOrganisations();
    getChilds();
  }, []);

  useEffect(() => {
    getChilds();
  }, [currentPage, selectedFilters]);

  // Table
  // table data
  const [childs, setChilds] = useState([]);
  // formatting table data
  const getConvertedChilds = (unConvertedChilds) => {
    let newChilds = [];
    unConvertedChilds.results.forEach((child) => {
      newChilds.push(covertToChildsData(child));
    });
    setChilds(newChilds);
  };

  const covertToChildsData = (child) => {
    return {
      id: child.id,
      code: child.code,
      gender: child.gender,
      volunteer:
        child.volunteer != null
          ? `${child.volunteer.user.first_name} ${child.volunteer.user.last_name}`
          : "",
      organisation: child.child_organisation[0].name,
      city: child.child_city[0].name,
    };
  };

  // table header
  const theadData = ["Kod", "Spol", "Volonter", "Organizacija", "Grad"];

  // table functions
  const editChlid = (row) => {
    navigateToChildDetails(row);
  };

  // chid details
  const openAddChildPage = () => {
    navigateToChildDetails(undefined);
  };

  const navigateToChildDetails = (selectedChild) => {
    let path = `details`;
    navigate(path, {
      state: {
        selectedChild: selectedChild,
        isEditMode: selectedChild !== undefined,
      },
    });
  };

  const searchClicked = async (filters) => {
    setCurrentPage(1);
    setSelectedFilters(filters);
  };

  // APIs
  const getChilds = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/childs/`, {
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
        getConvertedChilds(response.data);
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
  const [childToDelete, setChildToDelete] = useState(undefined);

  const deleteChild = (row) => {
    setShowConfirmationModal(true);
    setChildToDelete(row);
  };

  const onConfirmationModalClose = (isConfirmed) => {
    if (isConfirmed) {
      deleteChildRequest(childToDelete);
    } else {
      setShowConfirmationModal(false);
    }
  };

  // table functions
  const deleteChildRequest = async (row) => {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}/childs/${row.id}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setShowConfirmationModal(false);
        setChildToDelete(undefined);
        getChilds();
      })
      .catch((error) => {
        if (error.response.status === 409) {
          setShowConfirmationModal(false);
          toast("Dijete ne može biti izbrisano jer je vezano za volontera!", {
            type: "error",
            position: "top-center",
            autoClose: false,
            hideProgressBar: true,
            className: "toastToFront",
          });
        } else {
          console.log(error);
        }
      });
  };

  const downloadExcelFile = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/childs/download`, {
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
      onClick: editChlid,
      showAction: () => true,
    },
    {
      name: "Obriši",
      iconClass: "fas fa-trash redIcon",
      onClick: deleteChild,
      showAction: () => true,
    },
  ];

  if (authenticate && !hasVolunteerGroup(userRoles)) {
    return (
      <div>
        <h1>Djeca</h1>
        <div className="filterComponentDiv">
          <FilterComponent
            filters={filters}
            organisationList={organisations}
            onSearch={searchClicked}
          />
          <div className="childFilterButtons">
            <button className="btn btn-success" onClick={openAddChildPage}>
              Dodaj dijete
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
          <Table header={theadData} data={childs} actions={actions} />
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
            message="Da li ste sigurni da želite izbrisati ovo dijete?"
            onModalClose={onConfirmationModalClose}
          />
        )}
      </div>
    );
  }
  return null;
}

export default Child;
