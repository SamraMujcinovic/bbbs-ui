import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import axios from "axios";
import { hasVolunteerGroup } from "../utilis/ServiceUtil";

function Child(props) {
  // navigation
  let navigate = useNavigate();

  // authentication
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  useEffect(() => {
    getChilds();
  }, []);

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
    "Godina rođenja",
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
        isEditMode: selectedChild !== undefined,
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

  if (authenticate && !hasVolunteerGroup(userRoles)) {
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
  return null;
}

export default Child;
