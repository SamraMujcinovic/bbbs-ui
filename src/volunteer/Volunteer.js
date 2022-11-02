import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";
import { hasVolunteerGroup } from "../utilis/ServiceUtil";

function Volunteer(props) {
  // navigation
  let navigate = useNavigate();

  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  // table data
  const theadData = ["Ime", "Prezime", "E-mail", "Organizacija", "Grad", ""];
  const [volunteers, setVolunteers] = useState([]);

  const getSelectedRow = (row) => {
    navigateToVolunteerDetails(row);
  };

  useEffect(() => {
    getVolunteers();
  }, []);

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
    unConvertedVolunteers.data.forEach((volunteer) => {
      newVolunteers.push(covertToVolunteerData(volunteer));
    });
    setVolunteers(newVolunteers);
  };

  const getVolunteers = async () => {
    await axios
      .get("http://localhost:8000/volunteers/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => getConvertedVolunteers(response))
      .catch((error) => {
        console.log(error);
      });
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
      </div>
    );
  }
  return null;
}

export default Volunteer;
