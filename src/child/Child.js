import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";

function Child(props) {
  // navigation
  let navigate = useNavigate();

  useEffect(() => {
    getChilds();
    getOrganisations();
    getCities();
    getCoordinators();
  }, []);

  // authenticate
  const [authenticate, setAuthenticate] = sessionStorage.getItem("token");

  // organisations and cities to select
  const [organisations, setOrganisations] = useState([]);
  const [cities, setCities] = useState([]);
  const [coordinators, setCoordinators] = useState([]);

  // Table
  // table data
  const [childs, setChilds] = useState([]);
  // formatting table data
  const getConvertedChilds = (unConvertedChilds) => {
    let newChilds = [];
    unConvertedChilds.data.forEach((child) => {
      newChilds.push(covertToChildsData(child));
    });
    setChilds(newChilds);
  };

  const covertToChildsData = (child) => {
    return {
      id: child.id,
      code: child.code,
      gender: child.gender,
      birth_year: child.birth_year,
      volunteer:
        child.volunteer != null
          ? `${child.volunteer.user.first_name} ${child.volunteer.user.last_name}`
          : "",
      organisation: child.child_organisation[0].name,
      city: child.child_city[0].name,
    };
  };

  // table header
  const theadData = [
    "Kod",
    "Spol",
    "Godina rodjenja",
    "Volonter",
    "Organizacija",
    "Grad",
    "",
  ];

  // table functions
  const getSelectedRow = (row) => {
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
        isEditMode: selectedChild != undefined,
        organisations: organisations,
        cities: cities,
        coordinators: coordinators,
      },
    });
  };

  // APIs
  const getChilds = async () => {
    await axios
      .get("http://localhost:8000/childs/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => getConvertedChilds(response))
      .catch((error) => {
        console.log(error);
      });
  };

  const getOrganisations = async () => {
    await axios
      .get("http://localhost:8000/organisations/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => setOrganisations(response.data))
      .catch((error) => {
        console.log(error);
      });
  };

  const getCities = async () => {
    await axios
      .get("http://localhost:8000/cities/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => setCities(response.data))
      .catch((error) => {
        console.log(error);
      });
  };

  const getCoordinators = async () => {
    await axios
      .get("http://localhost:8000/coordinators/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setCoordinators(response.data.map(covertToCoordinatorData));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const covertToCoordinatorData = (coordinator) => {
    return {
      id: coordinator.id,
      first_name: coordinator.user.first_name,
      last_name: coordinator.user.last_name,
      name: `${coordinator.user.first_name} ${coordinator.user.last_name}`,
      email: coordinator.user.email,
      organisation: coordinator.coordinator_organisation[0].name,
      organisation_id: coordinator.coordinator_organisation[0].id,
      city: coordinator.coordinator_city[0].name,
      city_id: coordinator.coordinator_city[0].id,
    };
  };

  return (
    <div>
      <h1>Djeca</h1>
      <button className="btn btn-success" onClick={openAddChildPage}>
        Dodaj dijete
      </button>
      <Table
        theadData={theadData}
        tbodyData={childs}
        getRowData={getSelectedRow}
      />
    </div>
  );
}

export default Child;
