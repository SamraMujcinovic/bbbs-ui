import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Table from "../table/Table";
import ReactPaginate from "react-paginate";

import FilterComponent from "../filter/FilterComponent";

import { hasVolunteerGroup, PAGE_SIZE } from "../utilis/ServiceUtil";
import ConfirmationModal from "../confirmation_modal/ConfirmationModal";
import { format } from "date-fns";

function Form(props) {
  // navigation
  let navigate = useNavigate();

  const userGroups = sessionStorage.getItem("roles");
  const [currentVolunteer, setCurrentVolunteer] = useState(undefined);

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [totalHours, setTotalHours] = useState(0);

  const [organisations, setOrganisations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const activityTypes = [
    "Individualno",
    "Druženje sa drugim parovima",
    "Grupna aktivnost",
    "Izlet",
    "Individualni savjetodavni",
    "Grupni savjetodavni",
    "Radionica za rad na sebi",
  ];

  // table data
  const theadData = [
    "Datum",
    "Volonter",
    "Organizacija",
    "Grad",
    "Trajanje",
    "Ocjena",
  ];
  const [forms, setForms] = useState([]);

  const filters = {
    showOrganisationFilter: true,
    showVolunteerFilter: true,
    showActivityTypeFilter: true,
    showDateFilter: true,
  };

  const today = new Date();
  const defaultStartDate = format(
    new Date(today.getFullYear(), 0, 1), // 01.01.currentYear
    "yyyy-MM-dd"
  );
  const defaultEndDate = format(today, "yyyy-MM-dd");

  useEffect(() => {
    getAccessibleVolunteers();
    getAccessibleOrganisations();
    getForms();
    if (hasVolunteerGroup(userGroups)) {
      getVolunteer();
    }
  }, []);

  useEffect(() => {
    getForms();
  }, [currentPage]);

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

  const getAccessibleVolunteers = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setVolunteers(response.data.results.map(covertToVolunteerData));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const covertToVolunteerData = (volunteer) => {
    return {
      id: volunteer.id,
      first_name: volunteer.user.first_name,
      last_name: volunteer.user.last_name,
      name: `${volunteer.user.first_name} ${volunteer.user.last_name}`,
    };
  };

  const getVolunteer = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setCurrentVolunteer(response?.data.results[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const editForm = (row) => {
    navigateToFormDetails(row);
  };

  const getForms = async (filters) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/forms/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          startDate: filters?.startDate ?? defaultStartDate,
          endDate: filters?.endDate ?? defaultEndDate,
          organisationFilter:
            filters?.organisationFilter === ""
              ? undefined
              : filters?.organisationFilter,
          volunteerFilter:
            filters?.volunteerFilter === ""
              ? undefined
              : filters?.volunteerFilter,
          activityTypeFilter:
            filters?.activityTypeFilter === ""
              ? undefined
              : filters?.activityTypeFilter,
          page: currentPage,
        },
      })
      .then((response) => {
        setTotalElements(response.data.count);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
        getConvertedForms(response.data);
        getTotalHoursSum(filters);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getConvertedForms = (unConvertedForms) => {
    let newForms = [];
    unConvertedForms.results.forEach((form) => {
      newForms.push(covertToFormData(form));
    });
    setForms(newForms);
  };

  // formatting table data
  const covertToFormData = (form) => {
    return {
      id: form.id,
      date: form.date,
      volunteer: `${form.volunteer.user.first_name} ${form.volunteer.user.last_name}`,
      organisation: form.volunteer.volunteer_organisation[0].name,
      city: form.volunteer.volunteer_city[0].name,
      duration: form.duration,
      evaluation: form.evaluation,
    };
  };

  const getTotalHoursSum = async (filters) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/forms/totals`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          startDate: filters?.startDate ?? defaultStartDate,
          endDate: filters?.endDate ?? defaultEndDate,
          organisationFilter:
            filters?.organisationFilter === ""
              ? undefined
              : filters?.organisationFilter,
          volunteerFilter:
            filters?.volunteerFilter === ""
              ? undefined
              : filters?.volunteerFilter,
          activityTypeFilter:
            filters?.activityTypeFilter === ""
              ? undefined
              : filters?.activityTypeFilter,
        },
      })
      .then((response) => {
        setTotalHours(response.data.totalHours);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // add volunteer page
  const openAddFormPage = () => {
    navigateToFormDetails(undefined);
  };

  const navigateToFormDetails = (selectedForm) => {
    let path = `details`;
    navigate(path, {
      state: {
        selectedForm: selectedForm,
        isViewMode: selectedForm !== undefined,
      },
    });
  };

  const handlePaginationChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formToDelete, setFormToDelete] = useState(undefined);

  const deleteForm = (row) => {
    setShowConfirmationModal(true);
    setFormToDelete(row);
  };

  const onConfirmationModalClose = (isConfirmed) => {
    if (isConfirmed) {
      deleteFormRequest(formToDelete);
    } else {
      setShowConfirmationModal(false);
    }
  };

  // table functions
  const deleteFormRequest = async (row) => {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}/forms/${row.id}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setShowConfirmationModal(false);
        setFormToDelete(undefined);
        getForms();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const actions = [
    {
      name: "Edituj",
      iconClass: "fas fa-pencil-alt orangeIcon",
      onClick: editForm,
      showAction: () => true,
    },
    {
      name: "Obriši",
      iconClass: "fas fa-trash redIcon",
      onClick: deleteForm,
      showAction: () => !hasVolunteerGroup(userGroups),
    },
  ];

  return (
    <div>
      <h1>Forme</h1>
      <div className="filterComponentDiv">
        <FilterComponent
          filters={filters}
          organisationList={organisations}
          volunteerList={volunteers}
          activityTypeList={activityTypes}
          defaultStartDate={defaultStartDate}
          defaultEndDate={defaultEndDate}
          onSearch={getForms}
        />
        {hasVolunteerGroup(userGroups) ? (
          <button className="btn btn-success" onClick={openAddFormPage}>
            Dodaj formu
          </button>
        ) : null}
      </div>

      <div className="footerDiv">
        <Table header={theadData} data={forms} actions={actions} />
        <div className="paginationDiv">
          <div>Suma sati: {totalHours}</div>
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
      {showConfirmationModal && (
        <ConfirmationModal
          message="Da li ste sigurni da želite izbrisati ovu formu?"
          onModalClose={onConfirmationModalClose}
        />
      )}
    </div>
  );
}

export default Form;
