import React, { useState, useEffect } from "react";

import DatePicker, { registerLocale } from "react-datepicker";
import { format, parseISO } from "date-fns";
import { bs } from "date-fns/locale"; // Import Bosnian

import "react-datepicker/dist/react-datepicker.css";

import "../filter/FilterComponent.css";

// Register the locale
registerLocale("bs", bs);

const FilterComponent = ({
  filters,
  organisationList,
  volunteerList,
  activityTypeList,
  defaultStartDate,
  defaultEndDate,
  onSearch,
}) => {
  const [selectedFilters, setSelectedFilters] = useState({
    organisationFilter: "",
    volunteerFilter: "",
    activityTypeFilter: "",
    startDate: parseISO(defaultStartDate ?? format(new Date(), "yyyy-MM-dd")),
    endDate: parseISO(defaultEndDate ?? format(new Date(), "yyyy-MM-dd")),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters({
      ...selectedFilters,
      [name]: value === "" ? undefined : value,
    });
  };

  const handleDateChange = (date, name) => {
    setSelectedFilters({
      ...selectedFilters,
      [name]: date,
    });
  };

  const handleSearch = () => {
    const formattedFilters = {
      ...selectedFilters,
      startDate: format(selectedFilters.startDate, "yyyy-MM-dd"),
      endDate: format(selectedFilters.endDate, "yyyy-MM-dd"),
    };
    onSearch(formattedFilters);
  };

  useEffect(() => {
    // Trigger the initial search when the component mounts
    handleSearch();
  }, []);

  return (
    <div className="filter-component">
      {filters.showOrganisationFilter && (
        <select
          name="organisationFilter"
          value={selectedFilters.organisationFilter}
          onChange={handleInputChange}
        >
          <option value="">Organizacija</option>
          {organisationList?.map((option, index) => (
            <option key={index} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      )}

      {filters.showVolunteerFilter && (
        <select
          name="volunteerFilter"
          value={selectedFilters.volunteerFilter}
          onChange={handleInputChange}
        >
          <option value="">Volonter</option>
          {volunteerList?.map((option, index) => (
            <option key={index} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      )}

      {filters.showActivityTypeFilter && (
        <select
          name="activityTypeFilter"
          value={selectedFilters.activityTypeFilter}
          onChange={handleInputChange}
        >
          <option value="">Vrsta aktivnosti</option>
          {activityTypeList.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {filters.showDateFilter && (
        <>
          <DatePicker
            selected={selectedFilters.startDate}
            onChange={(date) => handleDateChange(date, "startDate")}
            dateFormat="dd.MM.yyyy"
            locale="bs" // Use the registered locale
            placeholderText="Od"
            className="date-picker"
            calendarStartDay={1} // Week starts on Monday
          />
          <DatePicker
            selected={selectedFilters.endDate}
            onChange={(date) => handleDateChange(date, "endDate")}
            dateFormat="dd.MM.yyyy"
            locale="bs" // Use the registered locale
            placeholderText="Do"
            className="date-picker"
            calendarStartDay={1} // Week starts on Monday
          />
        </>
      )}

      <button onClick={handleSearch}>Pretraga</button>
    </div>
  );
};

export default FilterComponent;
