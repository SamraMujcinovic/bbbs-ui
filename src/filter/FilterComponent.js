import React, { useState, useEffect } from "react";
import Select from "react-dropdown-select"; // Import react-dropdown-select
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
    organisationFilter: null,
    volunteerFilter: null,
    activityTypeFilter: null,
    startDate: parseISO(defaultStartDate ?? format(new Date(), "yyyy-MM-dd")),
    endDate: parseISO(defaultEndDate ?? format(new Date(), "yyyy-MM-dd")),
  });

  const handleInputChange = (values, name) => {
    setSelectedFilters({
      ...selectedFilters,
      [name]: values.length > 0 ? values[0].value : undefined,
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
        <Select
          name="organisationFilter"
          values={
            selectedFilters.organisationFilter
              ? [
                  {
                    value: selectedFilters.organisationFilter,
                    label: organisationList.find(
                      (option) =>
                        option.id === selectedFilters.organisationFilter
                    )?.name,
                  },
                ]
              : []
          }
          onChange={(values) => handleInputChange(values, "organisationFilter")}
          options={organisationList.map((option) => ({
            value: option.id,
            label: option.name,
          }))}
          placeholder="Organizacija"
        />
      )}

      {filters.showVolunteerFilter && (
        <Select
          name="volunteerFilter"
          values={
            selectedFilters.volunteerFilter
              ? [
                  {
                    value: selectedFilters.volunteerFilter,
                    label: volunteerList.find(
                      (option) => option.id === selectedFilters.volunteerFilter
                    )?.name,
                  },
                ]
              : []
          }
          onChange={(values) => handleInputChange(values, "volunteerFilter")}
          options={volunteerList.map((option) => ({
            value: option.id,
            label: option.name,
          }))}
          placeholder="Volonter"
        />
      )}

      {filters.showActivityTypeFilter && (
        <Select
          name="activityTypeFilter"
          values={
            selectedFilters.activityTypeFilter
              ? [
                  {
                    value: selectedFilters.activityTypeFilter,
                    label: selectedFilters.activityTypeFilter,
                  },
                ]
              : []
          }
          onChange={(values) => handleInputChange(values, "activityTypeFilter")}
          options={activityTypeList.map((option) => ({
            value: option,
            label: option,
          }))}
          placeholder="Vrsta aktivnosti"
        />
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
