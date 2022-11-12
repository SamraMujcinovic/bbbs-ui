import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Table from "../table/Table";
import { hasVolunteerGroup } from "../utilis/ServiceUtil";

function Form(props) {
  // navigation
  let navigate = useNavigate();

  const userGroups = sessionStorage.getItem("roles");
  const [currentVolunteer, setCurrentVolunteer] = useState(undefined);

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

  const getVolunteer = async () => {
    await axios
      .get(`http://localhost:8000/volunteers/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setCurrentVolunteer(response?.data[0]);
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
      })
      .then((response) => getConvertedForms(response))
      .catch((error) => {
        console.log(error);
      });
  };

  const getConvertedForms = (unConvertedForms) => {
    let newForms = [];
    unConvertedForms.data.forEach((form) => {
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
    </div>
  );
}

export default Form;
