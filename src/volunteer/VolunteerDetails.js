import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import Select from "react-dropdown-select";
import { useLocation, useNavigate } from "react-router-dom";
import { hasAdminGroup, hasCoordinatorGroup } from "../utilis/ServiceUtil";

import "../volunteer/Volunteer.css";
import { UserAuthenticated } from "../globalStates/AuthenticateContext";
import { UserGroups } from "../globalStates/UserGroups";

function VolunteerDetails() {
  // authenticate
  const [authenticate, setAuthenticate] = useContext(UserAuthenticated);
  const [userGroups] = useContext(UserGroups);

  // navigation
  let navigate = useNavigate();

  const navigateToVolunteers = () => {
    let path = `/volunteers`;
    navigate(path);
  };

  const location = useLocation();

  // volunteer details
  const [volunteerFirstName, setVolunteerFirstName] = useState("");
  const [volunteerLastName, setVolunteerLastName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerGender, setVolunteerGender] = useState("Muški");

  const [volunteerBirthYear, setVolunteerBirthYear] = useState(undefined);
  const [yearsToSelect, setYearsToSelect] = useState([]);

  const [volunteerPhoneNumber, setVolunteerPhoneNumber] = useState("");
  const [volunteerEducationLevel, setVolunteerEducationLevel] = useState(
    "Srednja skola"
  );
  const [volunteerFacultyDepartment, setVolunteerFacultyDepartment] = useState(
    ""
  );
  const [volunteerEmploymentStatus, setVolunteerEmploymentStatus] = useState(
    "Zaposlen"
  );
  const [
    volunteerGoodConductCertificate,
    setVolunteerGoodConductCertificate,
  ] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState(false);
  const [volunteerCoordinator, setVolunteerCoordinator] = useState(undefined);
  const [volunteerOrganisation, setVolunteerOrganisation] = useState();
  const [volunteerCity, setVolunteerCity] = useState();

  const [childsCode, setChildsCode] = useState("");

  // data to select
  const [coordinators, setCoordinators] = useState([]);

  useEffect(() => {
    setYearsToSelect(createYearsArray());
    if (location.state.selectedVolunteer) {
      getVolunteer(location.state.selectedVolunteer.id);
    }
  }, []);

  useEffect(() => {
    if (
      volunteerOrganisation &&
      volunteerCity &&
      volunteerOrganisation.length > 0 &&
      volunteerCity.length > 0
    ) {
      getCoordinators();
    }
  }, [volunteerOrganisation, volunteerCity]);

  useEffect(() => {
    if (volunteerCoordinator) {
      setVolunteerCoordinator(
        coordinators.filter((coordinator) => {
          return coordinator.id === volunteerCoordinator.id;
        })
      );
    }
  }, [coordinators]);

  // data to select
  const createYearsArray = () => {
    const currentYear = new Date().getFullYear();
    let i = currentYear;
    let years = [];
    while (i >= currentYear - 70) {
      years.push({
        label: i,
        value: i,
      });
      i--;
    }

    return years;
  };

  const getVolunteer = async (id) => {
    await axios
      .get(`http://localhost:8000/volunteers/${id}/`, {
        withCredentials: true,
      })
      .then((response) => {
        setInitialData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // set initial data (if volunteer is selected)
  const setInitialData = (selectedVolunteer) => {
    setVolunteerFirstName(selectedVolunteer.user.first_name);
    setVolunteerLastName(selectedVolunteer.user.last_name);
    setVolunteerEmail(selectedVolunteer.user.email);
    setVolunteerGender(selectedVolunteer.gender);
    setVolunteerBirthYear(
      createYearsArray().filter((year) => {
        return year.value === selectedVolunteer.birth_year;
      })
    );

    setVolunteerPhoneNumber(selectedVolunteer.phone_number);

    setVolunteerEducationLevel(selectedVolunteer.education_level);
    setVolunteerFacultyDepartment(selectedVolunteer.faculty_department);
    setVolunteerEmploymentStatus(selectedVolunteer.employment_status);
    setVolunteerGoodConductCertificate(
      selectedVolunteer.good_conduct_certificate
    );
    setVolunteerStatus(selectedVolunteer.status);
    setVolunteerCoordinator(selectedVolunteer.coordinator);
    setVolunteerOrganisation(selectedVolunteer.volunteer_organisation);
    setVolunteerCity(selectedVolunteer.volunteer_city);

    setChildsCode(selectedVolunteer.child);
  };

  const getCoordinators = async () => {
    await axios
      .get(`http://localhost:8000/coordinators/`, {
        params: {
          organisation: volunteerOrganisation[0].id,
          city: volunteerOrganisation[0].id,
        },
        withCredentials: true,
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

  // on event change methods
  const onGenderChange = (event) => {
    setVolunteerGender(event.target.value);
  };

  const onStatusChange = (event) => {
    setVolunteerStatus(str2bool(event.target.value));
  };

  const onGoodConductCertificateChange = (event) => {
    setVolunteerGoodConductCertificate(str2bool(event.target.value));
  };

  const onEducationLevelChange = (event) => {
    setVolunteerEducationLevel(event.target.value);
  };

  const onEmploymentStatusChange = (event) => {
    setVolunteerEmploymentStatus(event.target.value);
  };

  var str2bool = (value) => {
    // need this conversion because of radio button true/false values
    if (value && typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return value;
  };

  const onCoordinatorChange = (event) => {
    setVolunteerCoordinator(event);
  };

  const onOrganisationChange = (value) => {
    setVolunteerOrganisation(value);
    setVolunteerCoordinator(undefined);
  };

  const onCityChange = (value) => {
    setVolunteerCity(value);
    setVolunteerCoordinator(undefined);
  };

  const getSelectedValues = () => {
    return {
      user: {
        first_name: volunteerFirstName,
        last_name: volunteerLastName,
        email: volunteerEmail,
      },
      gender: volunteerGender,
      birth_year: volunteerBirthYear[0].value,
      phone_number: volunteerPhoneNumber,
      education_level: volunteerEducationLevel,
      faculty_department: volunteerFacultyDepartment,
      employment_status: volunteerEmploymentStatus,
      good_conduct_certificate: volunteerGoodConductCertificate,
      status: volunteerStatus,
      coordinator:
        volunteerCoordinator && volunteerCoordinator.length > 0
          ? volunteerCoordinator[0].id
          : undefined,
    };
  };

  const addVolunteer = async () => {
    await axios
      .post("http://localhost:8000/volunteers/", getSelectedValues(), {
        withCredentials: true,
      })
      .then(() => navigateToVolunteers())
      .catch((error) => {
        console.log(error);
      });
  };

  if (authenticate) {
    return (
      <div>
        <h1>Dodaj volontera</h1>

        <div>
          <div className="formDiv">
            <label>Ime</label>
            <input
              type="text"
              value={volunteerFirstName}
              onChange={(e) => setVolunteerFirstName(e.target.value)}
            />
          </div>
          <div className="formDiv">
            <label>Prezime</label>
            <input
              type="text"
              value={volunteerLastName}
              onChange={(e) => setVolunteerLastName(e.target.value)}
            />
          </div>
          <div className="formDiv">
            <label>E-mail</label>
            <input
              type="text"
              value={volunteerEmail}
              onChange={(e) => setVolunteerEmail(e.target.value)}
            />
          </div>
          <div className="formDiv">
            <label>Telefon</label>
            <input
              type="text"
              value={volunteerPhoneNumber}
              onChange={(e) => setVolunteerPhoneNumber(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label>Godina rođenja</label>
          <Select
            values={volunteerBirthYear}
            options={yearsToSelect}
            onChange={(values) => setVolunteerBirthYear(values)}
            placeholder="Godina rodjenja"
            valueField="label"
            labelField="value"
          />
          <div className="formDiv">
            <span>Spol</span>
            <div className="radioButtonsDiv">
              <div className="radioButtons">
                <input
                  type="radio"
                  value="Muški"
                  name="gender"
                  checked={volunteerGender === "Muški"}
                  onChange={onGenderChange}
                />
                <label>Muški</label>
              </div>
              <div className="radioButtons">
                <input
                  type="radio"
                  value="Ženski"
                  name="gender"
                  checked={volunteerGender === "Ženski"}
                  onChange={onGenderChange}
                />
                <label>Ženski</label>
              </div>
              <div className="radioButtons">
                <input
                  type="radio"
                  value="Ostali"
                  name="gender"
                  checked={volunteerGender === "Ostali"}
                  onChange={onGenderChange}
                />
                <label>Ostali</label>
              </div>
            </div>
          </div>
        </div>
        <div>
          {hasAdminGroup(userGroups) ? (
            <div>
              <label>Organizacija</label>
              <Select
                values={volunteerOrganisation}
                options={location.state.organisations}
                onChange={(values) => onOrganisationChange(values)}
                placeholder="Organizacija"
                valueField="id"
                labelField="name"
                disabled={location.state.isEditMode}
              />

              <label>Grad</label>
              <Select
                options={location.state.cities}
                values={volunteerCity}
                onChange={(values) => onCityChange(values)}
                placeholder="Grad"
                valueField="id"
                labelField="name"
                disabled={location.state.isEditMode}
              />

              <label>Koordinator</label>
              <Select
                values={volunteerCoordinator}
                options={coordinators}
                onChange={(values) => onCoordinatorChange(values)}
                placeholder="Koordinator"
                valueField="id"
                labelField="name"
                disabled={
                  !volunteerOrganisation ||
                  !volunteerCity ||
                  location.state.isEditMode
                }
              />
            </div>
          ) : null}
          {location.state.isEditMode ? (
            <div className="formDiv">
              <label>Dijete</label>
              <input
                type="text"
                value={childsCode ? childsCode : ""}
                disabled={true}
              />
            </div>
          ) : null}
        </div>
        <div className="formDiv">
          <span>Status u programu</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="status"
                checked={volunteerStatus}
                onChange={onStatusChange}
              />
              <label>Aktivan</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value={false}
                name="status"
                checked={!volunteerStatus}
                onChange={onStatusChange}
              />
              <label>Neaktivan</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span>Potvrda o nekažnjavanju:</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="good_conduct"
                checked={volunteerGoodConductCertificate}
                onChange={onGoodConductCertificateChange}
              />
              <label>Posjeduje</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value={false}
                name="good_conduct"
                checked={!volunteerGoodConductCertificate}
                onChange={onGoodConductCertificateChange}
              />
              <label>Ne posjeduje</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span>Nivo obrazovanja</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Srednja skola"
                name="education_level"
                checked={volunteerEducationLevel === "Srednja skola"}
                onChange={onEducationLevelChange}
              />
              <label>Srednja skola</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Bachelor"
                name="education_level"
                checked={volunteerEducationLevel === "Bachelor"}
                onChange={onEducationLevelChange}
              />
              <label>Bachelor</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Master"
                name="education_level"
                checked={volunteerEducationLevel === "Master"}
                onChange={onEducationLevelChange}
              />
              <label>Master</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Doktor nauka"
                name="education_level"
                checked={volunteerEducationLevel === "Doktor nauka"}
                onChange={onEducationLevelChange}
              />
              <label>Doktor nauka</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <label>Fakultet/odsjek</label>
          <input
            type="text"
            value={volunteerFacultyDepartment ? volunteerFacultyDepartment : ""}
            onChange={(e) => setVolunteerFacultyDepartment(e.target.value)}
          />
        </div>
        <div className="formDiv">
          <span>Radni stauts</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Zaposlen"
                name="employment_status"
                checked={volunteerEmploymentStatus === "Zaposlen"}
                onChange={onEmploymentStatusChange}
              />
              <label>Zaposlen</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Nezaposlen"
                name="employment_status"
                checked={volunteerEmploymentStatus === "Nezaposlen"}
                onChange={onEmploymentStatusChange}
              />
              <label>Nezaposlen</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Student"
                name="employment_status"
                checked={volunteerEmploymentStatus === "Student"}
                onChange={onEmploymentStatusChange}
              />
              <label>Student</label>
            </div>
          </div>
        </div>

        <Button type="submit" onClick={addVolunteer}>
          Submit
        </Button>
        <Button variant="secondary" onClick={navigateToVolunteers}>
          Close
        </Button>
      </div>
    );
  }
  return null;
}

export default VolunteerDetails;
