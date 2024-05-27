import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import Select from "react-dropdown-select";
import { useLocation, useNavigate } from "react-router-dom";
import {
  hasAdminGroup,
  hasCoordinatorGroup,
  hasVolunteerGroup,
  phoneNumberRegex,
  validEmailRegex,
} from "../utilis/ServiceUtil";

import { dateToString, stringToDate, months, days } from "../utilis/Date";

import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";

import "../volunteer/Volunteer.css";

function VolunteerDetails() {
  // authenticate
  const authenticate = sessionStorage.getItem("token");
  const userGroups = sessionStorage.getItem("roles");

  // navigation
  let navigate = useNavigate();

  const navigateToVolunteers = () => {
    let path = `/volunteers`;
    navigate(path);
  };

  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);

  // volunteer details
  const [volunteerFirstName, setVolunteerFirstName] = useState("");
  const [volunteerLastName, setVolunteerLastName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerGender, setVolunteerGender] = useState("Muški");

  const currentDate = new Date();
  const [volunteerBirthDate, setVolunteerBirthDate] = useState(
    new Date(currentDate.getFullYear() - 30, currentDate.getMonth(), 1)
  );
  const [volunteerAge, setVolunteerAge] = useState(
    currentDate.getFullYear() - volunteerBirthDate.getFullYear()
  );

  const [volunteerPhoneNumber, setVolunteerPhoneNumber] = useState("");
  const [volunteerEducationLevel, setVolunteerEducationLevel] =
    useState("Srednja škola");
  const [volunteerFacultyDepartment, setVolunteerFacultyDepartment] = useState(
    "Prirodno-matematički odsjeci (Matematika, fizika, biologija, geografija, hemija i sl.)"
  );
  const [volunteerFacultyDepartmentOther, setVolunteerFacultyDepartmentOther] =
    useState("");
  const [showFacultyDepartmentOther, setShowFacultyDepartmentOther] =
    useState(false);
  const [volunteerEmploymentStatus, setVolunteerEmploymentStatus] =
    useState("Zaposlen");
  const [volunteerGoodConductCertificate, setVolunteerGoodConductCertificate] =
    useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState(true);
  const [volunteerCoordinator, setVolunteerCoordinator] = useState(undefined);
  const [volunteerOrganisation, setVolunteerOrganisation] = useState();
  const [volunteerCity, setVolunteerCity] = useState();
  const [registrationDate, setRegistrationDate] = useState();

  const [childsCode, setChildsCode] = useState("");

  // data to select
  const [coordinators, setCoordinators] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [cities, setCities] = useState([]);

  // validation
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [dateInput, setDateInput] = useState("");
  const [isDateValid, setIsDateValid] = useState(true);

  useEffect(() => {
    getOrganisations();
    getCities();
    if (location.state.selectedVolunteer) {
      setIsEditMode(true);
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

  const getOrganisations = async () => {
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

  const getCities = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/cities/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => setCities(response.data))
      .catch((error) => {
        console.log(error);
      });
  };

  const getVolunteer = async (id) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/${id}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
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
    const birthDateAsDate = stringToDate(selectedVolunteer.birth_date);

    setVolunteerBirthDate(birthDateAsDate);
    setVolunteerAge(currentDate.getFullYear() - birthDateAsDate.getFullYear());

    setVolunteerPhoneNumber(selectedVolunteer.phone_number);

    setVolunteerEducationLevel(selectedVolunteer.education_level);
    setVolunteerFacultyDepartment(selectedVolunteer.faculty_department);
    setVolunteerFacultyDepartmentOther(
      selectedVolunteer.faculty_other_department
    );
    if (selectedVolunteer.faculty_other_department) {
      setShowFacultyDepartmentOther(true);
    }
    setVolunteerEmploymentStatus(selectedVolunteer.employment_status);
    setVolunteerGoodConductCertificate(
      selectedVolunteer.good_conduct_certificate
    );
    setVolunteerStatus(selectedVolunteer.status);
    setVolunteerCoordinator(selectedVolunteer.coordinator);
    setVolunteerOrganisation(selectedVolunteer.volunteer_organisation);
    setVolunteerCity(selectedVolunteer.volunteer_city);
    setRegistrationDate(selectedVolunteer.registration_date);

    setChildsCode(selectedVolunteer.child);
  };

  const getCoordinators = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/coordinators/`, {
        params: {
          organisation: volunteerOrganisation[0].id,
          city: volunteerCity[0].id,
        },

        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setCoordinators(response.data.results.map(covertToCoordinatorData));
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
    if (
      event &&
      volunteerCoordinator &&
      event[0] &&
      volunteerCoordinator[0] &&
      event[0].id !== volunteerCoordinator[0].id
    ) {
      // if coordinator changed
      setChildsCode("");
    }
    setVolunteerCoordinator(event);
  };

  const onOrganisationChange = (value) => {
    setVolunteerOrganisation(value);
    onCityChange(undefined);
  };

  const onCityChange = (value) => {
    setVolunteerCity(value);
    setVolunteerCoordinator(undefined);
  };

  const onEmailChange = (e) => {
    setVolunteerEmail(e.target.value);
    if (!validEmailRegex.test(e.target.value) && e.target.value !== "") {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  };

  const onPhoneNumberChange = (e) => {
    setVolunteerPhoneNumber(e.target.value);
    if (!phoneNumberRegex.test(e.target.value) && e.target.value !== "") {
      setIsPhoneNumberValid(false);
    } else {
      setIsPhoneNumberValid(true);
    }
  };

  const onDateChange = (date) => {
    const dateAsDate = new Date(date);
    setVolunteerBirthDate(dateAsDate);
    if (checkDateValidity(date)) {
      setIsDateValid(true);
      setVolunteerAge(currentDate.getFullYear() - dateAsDate.getFullYear());
    } else {
      setIsDateValid(false);
      setVolunteerAge(0);
    }
  };

  const checkDateValidity = (date) => {
    if (!date || date === null) {
      return false;
    }

    const selectedDate = new Date(date);

    if (selectedDate.getFullYear() > currentDate.getFullYear()) {
      return false;
    }

    if (
      selectedDate.getFullYear() === currentDate.getFullYear() &&
      selectedDate.getMonth() > currentDate.getMonth()
    ) {
      return false;
    }

    if (
      selectedDate.getFullYear() === currentDate.getFullYear() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getDate() > currentDate.getDate()
    ) {
      return false;
    }

    if (selectedDate.getMonth() > 12) {
      return false;
    }

    const lastDateInSelectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate();

    if (selectedDate.getDate() > lastDateInSelectedMonth) {
      return false;
    }

    return true;
  };

  const onDateInputChange = (e) => {
    // used to avoid date input
    // date can be selected from calendar only
    // with this approach we do not have to do lot of validations :)
    setDateInput(e.target.value);
  };

  const getSelectedValues = () => {
    return {
      user: {
        first_name: volunteerFirstName,
        last_name: volunteerLastName,
        email: volunteerEmail,
      },
      gender: volunteerGender,
      birth_date: dateToString(volunteerBirthDate),
      phone_number: volunteerPhoneNumber,
      education_level: volunteerEducationLevel,
      faculty_department: volunteerFacultyDepartment,
      faculty_other_department: volunteerFacultyDepartmentOther,
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
      .post(
        `${process.env.REACT_APP_API_URL}/volunteers/`,
        getSelectedValues(),
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then(() => navigateToVolunteers())
      .catch((error) => {
        console.log(error);
      });
  };

  const updateVolunteer = async () => {
    await axios
      .put(
        `${process.env.REACT_APP_API_URL}/volunteers/${location.state.selectedVolunteer.id}/`,
        getSelectedValues(),
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then(() => navigateToVolunteers())
      .catch((error) => {
        console.log(error);
      });
  };

  const shouldDisableForm = () => {
    if (hasAdminGroup(userGroups) || hasCoordinatorGroup(userGroups)) {
      return false;
    }
    return true;
  };

  const enableSubmitButton = () => {
    return (
      checkValidations() &&
      volunteerFirstName &&
      volunteerLastName &&
      volunteerEmail &&
      volunteerPhoneNumber &&
      volunteerBirthDate &&
      volunteerGender &&
      volunteerStatus !== undefined &&
      volunteerGoodConductCertificate !== undefined &&
      volunteerEducationLevel &&
      volunteerEmploymentStatus &&
      checkFacultyDepartmentOther() &&
      ((volunteerOrganisation &&
        volunteerOrganisation.length > 0 &&
        volunteerCity &&
        volunteerCity.length > 0 &&
        volunteerCoordinator &&
        volunteerCoordinator.length > 0) ||
        hasCoordinatorGroup(userGroups))
    );
  };

  const checkValidations = () => {
    return isEmailValid && isPhoneNumberValid;
  };

  const onFacultyDepartmentChange = (event) => {
    setVolunteerFacultyDepartment(event.target.value);
    if (event.target.value === "Drugo") {
      setShowFacultyDepartmentOther(true);
    } else {
      setVolunteerFacultyDepartmentOther(null);
      setShowFacultyDepartmentOther(false);
    }
  };

  const checkFacultyDepartmentOther = () => {
    return (
      volunteerFacultyDepartment !== "Drugo" ||
      (volunteerFacultyDepartment === "Drugo" &&
        volunteerFacultyDepartmentOther.length)
    );
  };

  if (authenticate && !hasVolunteerGroup(userGroups)) {
    return (
      <div>
        {location.state.selectedVolunteer ? (
          <h1>Volonter</h1>
        ) : (
          <h1>Dodaj volontera</h1>
        )}

        <div>
          <div className="formDiv">
            <label className="title">Ime</label>
            <input
              type="text"
              value={volunteerFirstName}
              onChange={(e) => setVolunteerFirstName(e.target.value)}
              disabled={shouldDisableForm()}
            />
          </div>
          <div className="formDiv">
            <label className="title">Prezime</label>
            <input
              type="text"
              value={volunteerLastName}
              onChange={(e) => setVolunteerLastName(e.target.value)}
              disabled={shouldDisableForm()}
            />
          </div>
          <div className="formDiv">
            <label className="title">E-mail</label>
            <input
              className={"" + (!isEmailValid ? "invalid-email" : "")}
              type="email"
              value={volunteerEmail}
              onChange={onEmailChange}
              disabled={isEditMode}
            />
          </div>
          <div className="formDiv">
            <label className="title">Telefon</label>
            <input
              className={"" + (!isPhoneNumberValid ? "invalid-email" : "")}
              type="text"
              placeholder="061123123"
              value={volunteerPhoneNumber}
              onChange={onPhoneNumberChange}
              disabled={shouldDisableForm()}
            />
          </div>
        </div>
        <div>
          <div className="formDiv">
            <label className="title dateSpan">Datum rođenja:</label>
            <DatePicker
              render={
                <InputIcon
                  className={
                    "dateInput " + (!isDateValid ? "invalid-email" : "")
                  }
                  value={dateInput}
                  onChange={onDateInputChange}
                  disabled={shouldDisableForm()}
                />
              }
              onChange={onDateChange}
              value={volunteerBirthDate}
              months={months}
              weekDays={days}
              format="DD.MM.YYYY"
              weekStartDayIndex={1}
              required={true}
              maxDate={currentDate}
              disabled={shouldDisableForm()}
            />
            <span className="title ageSpan">Starost volontera:</span>
            <span className="ageSpan">{volunteerAge} godina</span>
          </div>
          <div className="formDiv">
            <span className="title">Spol</span>
            <div className="radioButtonsDiv">
              <div className="radioButtons">
                <input
                  type="radio"
                  value="Muški"
                  name="gender"
                  checked={volunteerGender === "Muški"}
                  onChange={onGenderChange}
                  disabled={isEditMode}
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
                  disabled={isEditMode}
                />
                <label>Ženski</label>
              </div>
            </div>
          </div>
        </div>
        <div>
          {hasAdminGroup(userGroups) ? (
            <div>
              <label className="title">Organizacija</label>
              <Select
                values={volunteerOrganisation}
                options={organisations}
                onChange={(values) => onOrganisationChange(values)}
                placeholder="Organizacija"
                valueField="id"
                labelField="name"
              />

              <label className="title">Grad</label>
              <Select
                options={cities}
                values={volunteerCity}
                onChange={(values) => onCityChange(values)}
                placeholder="Grad"
                valueField="id"
                labelField="name"
                disabled={!volunteerOrganisation}
              />

              <label className="title">Koordinator</label>
              <Select
                values={volunteerCoordinator}
                options={coordinators}
                onChange={(values) => onCoordinatorChange(values)}
                placeholder="Koordinator"
                valueField="id"
                labelField="name"
                disabled={!volunteerOrganisation || !volunteerCity}
              />
            </div>
          ) : null}
          {location.state.isEditMode ? (
            <div className="formDiv">
              <label className="title">Dijete</label>
              <input
                type="text"
                value={childsCode ? childsCode : ""}
                disabled={true}
              />
            </div>
          ) : null}
        </div>
        <div className="formDiv">
          <span className="title">Status u programu</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="status"
                checked={volunteerStatus}
                onChange={onStatusChange}
                disabled={shouldDisableForm()}
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
                disabled={shouldDisableForm()}
              />
              <label>Neaktivan</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span className="title">Potvrda o nekažnjavanju:</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="good_conduct"
                checked={volunteerGoodConductCertificate}
                onChange={onGoodConductCertificateChange}
                disabled={shouldDisableForm()}
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
                disabled={shouldDisableForm()}
              />
              <label>Ne posjeduje</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span className="title">
            Nivo obrazovanja na kojem se trenutno nalazim (za zaposlene nivo
            obrazovanja koji ste završili):
          </span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Srednja škola"
                name="education_level"
                checked={volunteerEducationLevel === "Srednja škola"}
                onChange={onEducationLevelChange}
                disabled={shouldDisableForm()}
              />
              <label>Srednja škola</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Bachelor"
                name="education_level"
                checked={volunteerEducationLevel === "Bachelor"}
                onChange={onEducationLevelChange}
                disabled={shouldDisableForm()}
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
                disabled={shouldDisableForm()}
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
                disabled={shouldDisableForm()}
              />
              <label>Doktor nauka</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span className="title">Fakultet/odsjek/zanimanje:</span>
          <div className="radioButtonsDiv facultyDepartmentDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Prirodno-matematički odsjeci (Matematika, fizika, biologija, geografija, hemija i sl.)"
                name="faculty_department"
                checked={
                  volunteerFacultyDepartment ===
                  "Prirodno-matematički odsjeci (Matematika, fizika, biologija, geografija, hemija i sl.)"
                }
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Prirodno-matematički odsjeci (Matematika, fizika, biologija,
                geografija, hemija i sl)
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Tehničko - tehnološki odsjeci (mašinstvo, informatika, arhitektura, elektrotehnika i sl.)"
                name="faculty_department"
                checked={
                  volunteerFacultyDepartment ===
                  "Tehničko - tehnološki odsjeci (mašinstvo, informatika, arhitektura, elektrotehnika i sl.)"
                }
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Tehničko - tehnološki odsjeci (mašinstvo, informatika,
                arhitektura, elektrotehnika i sl.)
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Umjetnički odsjeci (scenske, likovne, muzičke i ostale umjetnosti)"
                name="faculty_department"
                checked={
                  volunteerFacultyDepartment ===
                  "Umjetnički odsjeci (scenske, likovne, muzičke i ostale umjetnosti)"
                }
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Umjetnički odsjeci (scenske, likovne, muzičke i ostale
                umjetnosti)
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Društveni odsjeci (ekonomija, pravo, politika, teologija, komunikologija, kriminalistika, historija,jezici i književnost i sl.)"
                name="faculty_department"
                checked={
                  volunteerFacultyDepartment ===
                  "Društveni odsjeci (ekonomija, pravo, politika, teologija, komunikologija, kriminalistika, historija,jezici i književnost i sl.)"
                }
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Društveni odsjeci (ekonomija, pravo, politika, teologija,
                komunikologija, kriminalistika, historija, jezici i književnost
                i sl.)
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Humanistički i pomagački odsjeci (psihologija, pedagogija, sociologija, socijalni rad,
                  defektologija, logopedija i sl.)"
                name="faculty_department"
                checked={
                  volunteerFacultyDepartment ===
                  "Humanistički i pomagački odsjeci (psihologija, pedagogija, sociologija, socijalni rad, defektologija, logopedija i sl.)"
                }
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Humanistički i pomagački odsjeci (psihologija, pedagogija,
                sociologija, socijalni rad, defektologija, logopedija i sl.)
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Zdravstveni odsjeci (primarna medicina, laboratorija, stomatologija, farmacija, fiziologija,
                  radiologija i sl.)"
                name="faculty_department"
                checked={
                  volunteerFacultyDepartment ===
                  "Zdravstveni odsjeci (primarna medicina, laboratorija, stomatologija, farmacija, fiziologija, radiologija i sl.)"
                }
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Zdravstveni odsjeci (primarna medicina, laboratorija,
                stomatologija, farmacija, fiziologija, radiologija i sl.)
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Srednja škola/Zanat"
                name="faculty_department"
                checked={volunteerFacultyDepartment === "Srednja škola/Zanat"}
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>Srednja škola/Zanat</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Drugo"
                name="faculty_department"
                checked={volunteerFacultyDepartment === "Drugo"}
                onChange={onFacultyDepartmentChange}
                disabled={shouldDisableForm()}
              />
              <label>Drugo</label>
            </div>
          </div>
        </div>
        {showFacultyDepartmentOther ? (
          <div className="formDiv">
            <label className="title">Navedite naziv fakulteta i odsjeka:</label>
            <input
              type="text"
              value={
                volunteerFacultyDepartmentOther
                  ? volunteerFacultyDepartmentOther
                  : ""
              }
              onChange={(e) =>
                setVolunteerFacultyDepartmentOther(e.target.value)
              }
              disabled={shouldDisableForm()}
            />
          </div>
        ) : null}
        {!checkFacultyDepartmentOther() && (
          <span className="invalid-developmental-difficulty">
            Navedite naziv fakulteta/odsjeka:
          </span>
        )}
        <div className="formDiv">
          <span className="title">Radni stauts</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Zaposlen"
                name="employment_status"
                checked={volunteerEmploymentStatus === "Zaposlen"}
                onChange={onEmploymentStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Zaposlen/a</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Nezaposlen"
                name="employment_status"
                checked={volunteerEmploymentStatus === "Nezaposlen"}
                onChange={onEmploymentStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Nezaposlen/a</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Student"
                name="employment_status"
                checked={volunteerEmploymentStatus === "Student"}
                onChange={onEmploymentStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Student/ica</label>
            </div>
          </div>
        </div>
        {isEditMode ? (
          <div className="formDiv">
            <label className="title dateSpan">Datum registracije:</label>
            <DatePicker
              render={
                <InputIcon
                  className={"dateInput"}
                  value={dateInput}
                  disabled={true}
                />
              }
              value={new Date(registrationDate)}
              months={months}
              weekDays={days}
              format="DD.MM.YYYY"
              weekStartDayIndex={1}
              required={true}
              maxDate={currentDate}
              disabled={true}
            />
          </div>
        ) : null}

        <div className="buttons">
          {shouldDisableForm() ? null : (
            <div>
              {!isEditMode ? (
                <Button
                  className="submitButton"
                  type="submit"
                  onClick={addVolunteer}
                  disabled={!enableSubmitButton()}
                >
                  Potvrdi
                </Button>
              ) : (
                <Button
                  className="submitButton"
                  type="submit"
                  onClick={updateVolunteer}
                  disabled={!enableSubmitButton()}
                >
                  Izmijeni
                </Button>
              )}
            </div>
          )}
          <Button variant="secondary" onClick={navigateToVolunteers}>
            Zatvori
          </Button>
        </div>
      </div>
    );
  }
  return null;
}

export default VolunteerDetails;
