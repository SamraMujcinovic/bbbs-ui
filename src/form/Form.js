import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Table from "../table/Table";
import ReactPaginate from "react-paginate";

import { hasVolunteerGroup, PAGE_SIZE } from "../utilis/ServiceUtil";

function Form(props) {
  // navigation
  let navigate = useNavigate();

  const userGroups = sessionStorage.getItem("roles");
  const [currentVolunteer, setCurrentVolunteer] = useState(undefined);

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // table data
  const theadData = [
    "Datum",
    "Volonter",
    "Dijete",
    "Organizacija",
    "Grad",
    "Trajanje",
    "Ocjena",
    "",
  ];
  const [forms, setForms] = useState([]);

  useEffect(() => {
    getForms();
    if (hasVolunteerGroup(userGroups)) {
      getVolunteer();
    }
  }, []);

  useEffect(() => {
    getForms();
  }, [currentPage]);

  const getVolunteer = async () => {
    await axios
      .get(`http://localhost:8000/volunteers/`, {
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

  const getSelectedRow = (row) => {
    navigateToFormDetails(row);
  };

  const getForms = async () => {
    await axios
      .get("http://localhost:8000/forms/", {
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
        getConvertedForms(response.data);
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
      child: form.child,
      organisation: form.volunteer.volunteer_organisation[0].name,
      city: form.volunteer.volunteer_city[0].name,
      duration: form.duration,
      evaluation: form.evaluation,
    };
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

  return (
    <div>
      <h1>Forme</h1>
      {hasVolunteerGroup(userGroups) &&
      currentVolunteer?.child !== undefined &&
      currentVolunteer?.child !== null ? (
        <button className="btn btn-success" onClick={openAddFormPage}>
          Dodaj formu
        </button>
      ) : null}
      <Table
        theadData={theadData}
        tbodyData={forms}
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

export default Form;
