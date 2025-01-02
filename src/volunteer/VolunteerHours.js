import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

import Table from "../table/Table";
import ReactPaginate from "react-paginate";

import { PAGE_SIZE } from "../utilis/ServiceUtil";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import FilterComponent from "../filter/FilterComponent";
import { calculateTotalTimeDuration } from "../utilis/Time";

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

  const filters = {
    showVolunteerFilter: false,
    showActivityTypeFilter: false,
    showDateFilter: true,
  };

  const today = new Date();
  const defaultStartDate = format(
    new Date(today.getFullYear(), today.getMonth() - 1, 1),
    "yyyy-MM-dd"
  );
  const lastDayOfMonth = new Date();
  lastDayOfMonth.setDate(0);
  const defaultEndDate = format(lastDayOfMonth, "yyyy-MM-dd");

  const [selectedStartDate, setSelectedStartDate] = useState(defaultStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState(defaultEndDate);

  const getvolunteerHours = async (filters) => {
    setSelectedStartDate(filters?.startDate ?? defaultStartDate);
    setSelectedEndDate(filters?.endDate ?? defaultEndDate);
    await axios
      .get(`${process.env.REACT_APP_API_URL}/hours/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          startDate: filters?.startDate ?? defaultStartDate,
          endDate: filters?.endDate ?? defaultEndDate,
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
      hours: calculateTotalTimeDuration(volunteerHours.volunteer_hours),
    };
  };

  const sendReminderEmailToVolunteer = async (volunteer_user_id) => {
    const id = toast.loading("Slanje E-Maila...");
    await axios
      .post(
        `${process.env.REACT_APP_API_URL}/reminders`,
        {
          volunteer_user_id: volunteer_user_id,
          start_date: selectedStartDate,
          end_date: selectedEndDate,
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
      showAction: (row) => row.hours < 16,
    },
  ];

  if (authenticate) {
    return (
      <div>
        <h1>Sati volontera</h1>
        <div className="filterComponentDiv">
          <FilterComponent
            filters={filters}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
            onSearch={getvolunteerHours}
          />
        </div>
        <div className="footerDiv">
          <Table header={theadData} data={volunteerHours} actions={actions} />
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

export default VolunteerHours;
