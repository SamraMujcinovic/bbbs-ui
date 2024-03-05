import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../table/Table";
import ReactPaginate from "react-paginate";

import { PAGE_SIZE } from "../utilis/ServiceUtil";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VolunteerHours(props) {
  // authentication
  const authenticate = sessionStorage.getItem("token");

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // table data
  const theadData = ["Ime", "Prezime", "Organizacija", "Grad", "Ukupni sati"];
  const [volunteerHours, setVolunteerHours] = useState([]);

  const getvolunteerHours = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/hours/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          startDate: "2022-12-01",
          endDate: "2022-12-31",
          page: currentPage,
        },
      })
      .then((response) => {
        setTotalElements(response.data.count);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
        setVolunteerHours(response.data.results.map(convertToVolunteerHours));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const convertToVolunteerHours = (volunteerHours) => {
    return {
      id: volunteerHours.volunteer_user_id,
      first_name: volunteerHours.volunteer_first_name,
      last_name: volunteerHours.volunteer_last_name,
      organisation: volunteerHours.volunteer_organisation,
      city: volunteerHours.volunteer_city,
      hours: volunteerHours.volunteer_hours,
    };
  };

  const sendReminderEmailToVolunteer = async (volunteer_user_id) => {
    const id = toast.loading("Slanje E-Maila...");
    await axios
      .post(
        `${process.env.REACT_APP_API_URL}/reminders`,
        {
          volunteer_user_id: volunteer_user_id,
          monthAndYear: "2022-12-01",
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        toast.update(id, {
          render: "E-Mail je poslan!",
          type: "success",
          isLoading: false,
          autoClose: false,
          closeButton: true,
        });
      })
      .catch((error) => {
        toast.dismiss(id);
        console.log(error);
      });
  };

  useEffect(() => {
    getvolunteerHours();
  }, [currentPage]);

  const handlePaginationChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const sendReminderEmail = (row) => {
    sendReminderEmailToVolunteer(row.id);
  };

  const actions = [
    {
      name: "Posalji e-mail",
      iconClass: "far fa-envelope redIcon",
      onClick: sendReminderEmail,
      showAction: (row) => row.hours < 4,
    },
  ];

  if (authenticate) {
    return (
      <div>
        <h1>Sati volontera</h1>
        <Table header={theadData} data={volunteerHours} actions={actions} />
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

export default VolunteerHours;
