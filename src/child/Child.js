import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";
import { hasVolunteerGroup, PAGE_SIZE } from "../utilis/ServiceUtil";

import "../table/Pagination.css";

import FilterComponent from "../filter/FilterComponent";

import ReactPaginate from "react-paginate";

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

  useEffect(() => {
    getAccessibleOrganisations();
    getChilds();
  }, []);

  useEffect(() => {
    getChilds();
  }, [currentPage]);

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

  // APIs
  const getChilds = async (filters) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/childs/`, {
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

  const actions = [
    {
      name: "Edituj",
      iconClass: "fas fa-pencil-alt orangeIcon",
      onClick: editChlid,
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
            onSearch={getChilds}
          />
          <button className="btn btn-success" onClick={openAddChildPage}>
            Dodaj dijete
          </button>
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
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default Child;
