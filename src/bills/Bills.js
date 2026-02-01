import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FilterComponent from "../filter/FilterComponent";
import Table from "../table/Table";
import ReactPaginate from "react-paginate";

import { MAX_PAGE_SIZE, PAGE_SIZE } from "../utilis/ServiceUtil";
import { format } from "date-fns";

function Bills() {
  const [organisations, setOrganisations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [bills, setBills] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0.0);

  const navigate = useNavigate();

  // table data
  const theadData = [
    "Mjesto",
    "Datum druženja",
    "Volonter",
    "Organizacija",
    "Iznos (KM)",
  ];

  // pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePaginationChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const filters = {
    showOrganisationFilter: true,
    showVolunteerFilter: true,
    showDateFilter: true,
  };
  const [selectedFilters, setSelectedFilters] = useState({});

  const today = new Date();
  const defaultStartDate = format(
    new Date(today.getFullYear(), today.getMonth() - 1, 1), // 01.01.currentYear
    "yyyy-MM-dd"
  );
  const defaultEndDate = format(today, "yyyy-MM-dd");

  useEffect(() => {
    getAccessibleVolunteers(MAX_PAGE_SIZE);
    getAccessibleOrganisations();
    getBills();
  }, []);

  useEffect(() => {
    getBills();
  }, [currentPage, selectedFilters]);

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

  const getAccessibleVolunteers = async (pageSize) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          page_size: pageSize,
        },
      })
      .then((response) => {
        setVolunteers(response.data.results.map(covertToVolunteerData));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const covertToVolunteerData = (volunteer) => {
    return {
      id: volunteer.id,
      first_name: volunteer.user.first_name,
      last_name: volunteer.user.last_name,
      name: `${volunteer.user.first_name} ${volunteer.user.last_name}`,
    };
  };

  const searchClicked = async (filters) => {
    setCurrentPage(1);
    setSelectedFilters(filters);
  };

  const getBills = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/bills/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params: {
          startDate: selectedFilters?.startDate ?? defaultStartDate,
          endDate: selectedFilters?.endDate ?? defaultEndDate,
          organisationFilter:
            selectedFilters?.organisationFilter === ""
              ? undefined
              : selectedFilters?.organisationFilter,
          volunteerFilter:
            selectedFilters?.volunteerFilter === ""
              ? undefined
              : selectedFilters?.volunteerFilter,
          page: currentPage,
        },
      })
      .then((response) => {
        setTotalElements(response.data.count);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
        getConvertedBills(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getConvertedBills = (unConvertedBills) => {
    setTotalAmount(unConvertedBills.results.total_amount);
    let newBills = [];
    unConvertedBills.results.results.forEach((bill) => {
      newBills.push(covertToBillData(bill));
    });
    setBills(newBills);
  };

  // formatting table data
  const covertToBillData = (bill) => {
    return {
      id: bill.id,
      place: bill.place,
      date: bill.form_date,
      volunteer: bill.volunteer_name,
      organisation: bill.organisation_name,
      amount: bill.amount,
      form_id: bill.form_id,
    };
  };

  const navigateToFormDetails = (selectedBill) => {
    navigate("/forms/details", {
      state: {
        selectedForm: { id: selectedBill.form_id },
        isViewMode: selectedBill !== undefined,
      },
    });
  };

  const actions = [
    {
      name: "Forma druženja",
      iconClass: "fas fa-file-alt blueIcon",
      onClick: navigateToFormDetails,
      showAction: () => true,
    },
  ];

  return (
    <div>
      <h1>Pregled računa</h1>
      <div className="filterComponentDiv">
        <FilterComponent
          filters={filters}
          organisationList={organisations}
          volunteerList={volunteers}
          defaultStartDate={defaultStartDate}
          defaultEndDate={defaultEndDate}
          onSearch={searchClicked}
        />
      </div>

      <div className="footerDiv">
        <Table header={theadData} data={bills} actions={actions} />
        <div className="paginationDiv">
          <div> Ukupno: {totalAmount.toFixed(2)} KM</div>
          <ReactPaginate
            className="pagination"
            onPageChange={handlePaginationChange}
            pageCount={totalPages}
            renderOnZeroPageCount={null}
            previousLabel="<"
            nextLabel=">"
            forcePage={currentPage - 1}
          />
        </div>
      </div>
    </div>
  );
}

export default Bills;
