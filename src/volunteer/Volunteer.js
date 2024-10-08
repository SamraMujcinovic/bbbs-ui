import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";
import { hasVolunteerGroup, PAGE_SIZE } from "../utilis/ServiceUtil";

import ReactPaginate from "react-paginate";

import FilterComponent from "../filter/FilterComponent";

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

  const editVolunteeer = (row) => {
    navigateToVolunteerDetails(row);
  };

  useEffect(() => {
    getAccessibleOrganisations();
    getVolunteers();
  }, []);

  useEffect(() => {
    getVolunteers();
  }, [currentPage]);

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

  const getVolunteers = async (filters) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          organisationFilter:
            filters?.organisationFilter === ""
              ? undefined
              : filters?.organisationFilter,
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

  const actions = [
    {
      name: "Edituj",
      iconClass: "fas fa-pencil-alt orangeIcon",
      onClick: editVolunteeer,
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
            onSearch={getVolunteers}
          />
          <button className="btn btn-success" onClick={openAddVolunteerPage}>
            Dodaj volontera
          </button>
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
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default Volunteer;
