import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Table from "../table/Table";
import { UserAuthenticated } from "../globalStates/AuthenticateContext";
import { hasVolunteerGroup } from "../utilis/ServiceUtil";
import { UserGroups } from "../globalStates/UserGroups";

function Form(props) {
  // navigation
  let navigate = useNavigate();

  // authenticate
  const [authenticate, setAuthenticate] = useContext(UserAuthenticated);

  const [userGroups] = useContext(UserGroups);

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
  const [selectedTableRow, setSelectedTableRow] = useState({});

  useEffect(() => {
    getForms();
  }, []);

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
      child: form.volunteer.child,
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
        isViewMode: selectedForm != undefined,
      },
    });
  };

  return (
    <div>
      This is forms page!
      {hasVolunteerGroup(userGroups) ? (
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
