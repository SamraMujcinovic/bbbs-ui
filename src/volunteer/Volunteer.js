import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";
import { hasVolunteerGroup, PAGE_SIZE } from "../utilis/ServiceUtil";

import ReactPaginate from "react-paginate";

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
  const theadData = ["Ime", "Prezime", "E-mail", "Organizacija", "Grad", ""];
  const [volunteers, setVolunteers] = useState([]);

  const getSelectedRow = (row) => {
    navigateToVolunteerDetails(row);
  };

  useEffect(() => {
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

  const getVolunteers = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/`, {
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
        getConvertedVolunteers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePaginationChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  if (authenticate && !hasVolunteerGroup(userRoles)) {
    return (
      <div>
        <h1>Volonteri</h1>
        <button className="btn btn-success" onClick={openAddVolunteerPage}>
          Dodaj volontera
        </button>

        <Table
          theadData={theadData}
          tbodyData={volunteers}
          getRowData={getSelectedRow}
        />
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
      </div>
    );
  }
  return null;
}

export default Volunteer;
