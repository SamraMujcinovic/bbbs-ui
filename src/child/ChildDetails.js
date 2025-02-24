import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Select from "react-dropdown-select";
import { useLocation, useNavigate } from "react-router-dom";
import {
  hasAdminGroup,
  hasCoordinatorGroup,
  hasVolunteerGroup,
  MAX_PAGE_SIZE,
} from "../utilis/ServiceUtil";

import "../child/Child.css";
import { dateToString, stringToDate, months, days } from "../utilis/Date";

import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";

function ChildDetails() {
  // authenticate
  const authenticate = sessionStorage.getItem("token");
  const userGroups = sessionStorage.getItem("roles");

  const currentDate = new Date();

  // navigation
  let navigate = useNavigate();

  const navigateToChilds = () => {
    let path = `/childs`;
    navigate(path);
  };

  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);

  // child details
  const [child, setChild] = useState(undefined);
  const [childsCode, setChildsCode] = useState("");
  const [childsGender, setChildsGender] = useState("Muški");
  const [childsBirthDate, setChildsBirthDate] = useState(
    new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), 1)
  );
  const [childsAge, setChildsAge] = useState(
    currentDate.getFullYear() - childsBirthDate.getFullYear()
  );

  const [childSchoolStatus, setChildsSchoolStatus] = useState("Pohađa");
  const [childsFamilyModel, setChildsFamilyModel] =
    useState("Potpuna porodica");
  const [childsStatus, setChildsStatus] = useState(
    "Dijete prvi put učestvuje u programu"
  );
  const [childsVolunteer, setChildsVolunteer] = useState(undefined);
  const [childsCoordinator, setChildsCoordinator] = useState(undefined);
  const [childsGuardianConsent, setChildsGuardianConsent] = useState(false);
  const [vaccinationStatus, setVaccinationStatus] = useState(true);

  const [healthDifficulties, setHealthDifficulties] = useState("");
  const [showHealthDifficultiesTextbox, setShowHealthDifficultiesTextbox] =
    useState(false);
  const [activePUP, setActvePUP] = useState("");
  const [showActivePUPTextbox, setShowActivePUPTextbox] = useState(false);
  const [passivePUP, setPassivePUP] = useState("");
  const [showPassivePUPTextbox, setShowPassivePUPTextbox] = useState(false);
  const [childPotential, setChildPotential] = useState("");

  const [childOrganisation, setChildsOrganisation] = useState();
  const [childCity, setChildsCity] = useState();

  const [childsMentoringReason, setChildMentoringReason] = useState([]);
  const [childsDevelopmentalDifficulties, setChildsDevelopmentalDifficulties] =
    useState([]);

  // data to select
  const [coordinators, setCoordinators] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [cities, setCities] = useState([]);
  const [developmentalDifficulties, setDevelopmentalDifficulties] = useState(
    []
  );
  const [
    selectedDevelopmentalDifficulties,
    setSelectedDevelopmentalDifficulties,
  ] = useState([]);
  const [mentoringReasons, setMentoringReasons] = useState([]);
  const [mentoringReasonCategories, setMentoringReasonCategories] = useState(
    []
  );
  const [selectedMentoringReasons, setSelectedMentoringReasons] = useState([]);

  const [somethingElseTextBox, setSomethingElseTextBox] = useState("");
  const [showSomethingElseTextBox, setShowSomethingElseTextBox] =
    useState(false);

  // validations
  const [dateInput, setDateInput] = useState("");
  const [isDateValid, setIsDateValid] = useState(true);

  useEffect(() => {
    getMentoringReasons();
    getMentoringReasonCategories();
    getDevelopmentalDifficulties();
    getOrganisations();
    getCities();
    if (location.state.selectedChild) {
      setIsEditMode(true);
      getChild(location.state.selectedChild.id);
    }
  }, []);

  useEffect(() => {
    if (
      childOrganisation &&
      childCity &&
      childOrganisation.length > 0 &&
      childCity.length > 0
    ) {
      getCoordinators();
    }
  }, [childOrganisation, childCity]);

  useEffect(() => {
    if (hasCoordinatorGroup(userGroups)) {
      getVolunteers(undefined, undefined, undefined);
    } else if (childsCoordinator && childsCoordinator.length > 0) {
      getVolunteers(
        childsCoordinator[0].organisation_id,
        childsCoordinator[0].city_id,
        childsCoordinator[0].id,
        MAX_PAGE_SIZE
      );
    }
  }, [childsCoordinator, childsGender]);

  useEffect(() => {
    if (childsCoordinator) {
      setChildsCoordinator(
        coordinators.filter((coordinator) => {
          return coordinator.id === childsCoordinator.id;
        })
      );
    }
  }, [coordinators]);

  useEffect(() => {
    // use this way, it does not work on the other way!!!
    if (
      location.state.selectedChild &&
      location.state.selectedChild.volunteer
    ) {
      setChildsVolunteer(
        volunteers.filter((volunteer) => {
          return volunteer.childCode === location.state.selectedChild.code;
        })
      );
    }
  }, [volunteers]);

  // APIs

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

  const getCoordinators = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/coordinators/`, {
        params: {
          organisation: childOrganisation[0].id,
          city: childCity[0].id,
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

  const getVolunteers = async (organisation, city, coordinator, pageSize) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/volunteers/`, {
        params: {
          organisation: organisation,
          city: city,
          coordinator: coordinator,
          gender: getChildsGender(),
          status: "True",
          child: location.state.selectedChild
            ? location.state.selectedChild.id
            : undefined,
          availableVolunteers: "True",
          page_size: pageSize,
        },

        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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
      email: volunteer.user.email,
      organisation: volunteer.volunteer_organisation[0].name,
      city: volunteer.volunteer_city[0].name,
      childCode: volunteer.child,
    };
  };

  const getMentoringReasons = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/mentoring-reasons/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setMentoringReasons(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getMentoringReasonCategories = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/mentoring-reasons-categories/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setMentoringReasonCategories(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDevelopmentalDifficulties = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/developmental-difficulties/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setDevelopmentalDifficulties(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getChild = async (id) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/childs/${id}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setChild(response.data);
        setInitialData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // set initial data (if chid is selected)
  const setInitialData = (selectedChild) => {
    setChildsCode(selectedChild.code);
    setChildsGender(selectedChild.gender);
    const birthDateAsDate = stringToDate(selectedChild.birth_date);
    setChildsBirthDate(birthDateAsDate);
    setChildsAge(currentDate.getFullYear() - birthDateAsDate.getFullYear());
    setChildsSchoolStatus(selectedChild.school_status);
    setChildsFamilyModel(selectedChild.family_model);
    setChildsStatus(selectedChild.status);
    setChildsGuardianConsent(selectedChild.guardian_consent);
    setVaccinationStatus(selectedChild.vaccination_status);

    setChildsCoordinator(selectedChild.coordinator);

    setChildsDevelopmentalDifficulties(
      selectedChild.developmental_difficulties.map(
        (difficulty) => difficulty.id
      )
    );
    setSelectedDevelopmentalDifficulties(
      selectedChild.developmental_difficulties
    );

    setChildMentoringReason(
      selectedChild.mentoring_reason.map((reason) => reason.id)
    );
    setSelectedMentoringReasons(selectedChild.mentoring_reason);

    setChildsOrganisation(selectedChild.child_organisation);
    setChildsCity(selectedChild.child_city);
    setHealthDifficulties(selectedChild.health_difficulties);
    if (selectedChild.health_difficulties?.length) {
      setShowHealthDifficultiesTextbox(true);
    }
    setActvePUP(selectedChild.active_pup);
    if (selectedChild.active_pup?.length) {
      setShowActivePUPTextbox(true);
    }
    setPassivePUP(selectedChild.passive_pup);
    if (selectedChild.passive_pup?.length) {
      setShowPassivePUPTextbox(true);
    }
    setChildPotential(selectedChild.child_potential);

    if (selectedChild.something_else?.length) {
      setSomethingElseTextBox(selectedChild.something_else);
      setShowSomethingElseTextBox(true);
    }
  };

  // on event change methods
  const onGenderChange = (event) => {
    setChildsGender(event.target.value);
    setChildsVolunteer(undefined);
  };

  const onSchoolStatusChange = (event) => {
    setChildsSchoolStatus(event.target.value);
  };

  const onFamilyModelChange = (event) => {
    setChildsFamilyModel(event.target.value);
  };

  const onStatusChange = (event) => {
    setChildsStatus(event.target.value);
    if (event.target.value === "Dijete nije aktivno uključeno u program") {
      setChildsVolunteer(undefined);
    }
  };

  const onGuardianConsentChange = (event) => {
    setChildsGuardianConsent(str2bool(event.target.value));
  };

  const onVaccinationStatusChange = (event) => {
    setVaccinationStatus(str2bool(event.target.value));
  };

  var str2bool = (value) => {
    // need this conversion because of radio button true/false values
    if (value && typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return value;
  };

  const onDifficultyChange = (event) => {
    const selectedDifficulty = developmentalDifficulties.filter(
      (difficulty) => difficulty.id === Number(event.target.value)
    )[0];

    if (hasDevelopmentalDifficulty(selectedDifficulty)) {
      // if already exist => deselect that difficulty
      setSelectedDevelopmentalDifficulties(
        selectedDevelopmentalDifficulties.filter((difficulty) => {
          return difficulty.id !== selectedDifficulty.id;
        })
      );
      setShowHealthDifficultiesTextbox(false);
      setHealthDifficulties(""); // textbox
    } else {
      setSelectedDevelopmentalDifficulties([
        ...selectedDevelopmentalDifficulties,
        selectedDifficulty,
      ]);
      if (selectedDifficulty.id === 14) {
        // zdravstvene poteškoće
        setShowHealthDifficultiesTextbox(true);
      }
    }
  };

  const hasDevelopmentalDifficulty = (difficulty) => {
    return (
      selectedDevelopmentalDifficulties?.filter((value) => {
        return value.id === difficulty.id;
      }).length > 0
    );
  };

  const onMentoringReasonChange = (event) => {
    const selectedReason = mentoringReasons.filter(
      (reason) => reason.id === Number(event.target.value)
    )[0];

    if (hasMentoringReason(selectedReason)) {
      // if already exist => deselect that reason
      const mentoringReasonsFiltered = selectedMentoringReasons.filter(
        (reason) => {
          return reason.id !== selectedReason.id;
        }
      );
      setSelectedMentoringReasons(mentoringReasonsFiltered);
      if (selectedReason.id === 25) {
        // Pasivni PUP
        setShowPassivePUPTextbox(false);
        setPassivePUP("");
      }
      if (selectedReason.id === 26) {
        // Aktivni PUP
        setShowActivePUPTextbox(false);
        setActvePUP("");
      }
      if (
        !mentoringReasonsFiltered.some(
          (reason) => reason.name === "Nešto drugo"
        )
      ) {
        setShowSomethingElseTextBox(false);
        setSomethingElseTextBox("");
      }
    } else {
      setSelectedMentoringReasons([
        ...selectedMentoringReasons,
        selectedReason,
      ]);
      if (selectedReason.id === 25) {
        // Pasivni PUP
        setShowPassivePUPTextbox(true);
      }
      if (selectedReason.id === 26) {
        // Aktivni PUP
        setShowActivePUPTextbox(true);
      }
      if (selectedReason.name === "Nešto drugo") {
        setShowSomethingElseTextBox(true);
      }
    }
  };

  const hasMentoringReason = (reason) => {
    return (
      selectedMentoringReasons?.filter((value) => {
        return value.id === reason.id;
      }).length > 0
    );
  };

  const onCoordinatorChange = (event) => {
    setChildsCoordinator(event);
    setChildsVolunteer(undefined);
    setVolunteers([]);
  };

  const onChildsVolunteerChange = (event) => {
    setChildsVolunteer(event);
    if (event && childsStatus === "Dijete nije aktivno uključeno u program") {
      setChildsStatus("Dijete prvi put učestvuje u programu");
    }
  };

  const onOrganisationChange = (value) => {
    setChildsOrganisation(value);
    setChildsCoordinator(undefined);
    setChildsVolunteer(undefined);
  };

  const onCityChange = (value) => {
    setChildsCity(value);
    setChildsCoordinator(undefined);
    setChildsVolunteer(undefined);
  };

  const onDateChange = (date) => {
    const dateAsDate = new Date(date);
    setChildsBirthDate(dateAsDate);
    if (checkDateValidity(date)) {
      setIsDateValid(true);
      setChildsAge(currentDate.getFullYear() - dateAsDate.getFullYear());
    } else {
      setIsDateValid(false);
      setChildsAge(0);
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

  const getChildsGender = () => {
    // if female child then only female mentors
    if (childsGender === "Ženski") {
      return "Z";
    }
    // else if child is male, volunteer can be female
    return null;
  };

  const addChild = async () => {
    await axios
      .post(`${process.env.REACT_APP_API_URL}/childs/`, getSelectedValues(), {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then(() => navigateToChilds())
      .catch((error) => {
        console.log(error);
      });
  };

  const updateChild = async () => {
    await axios
      .put(
        `${process.env.REACT_APP_API_URL}/childs/${location.state.selectedChild.id}/`,
        getSelectedValues(),
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        navigateToChilds();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getSelectedValues = () => {
    return {
      code: childsCode,
      gender: childsGender,
      birth_date: dateToString(childsBirthDate),
      school_status: childSchoolStatus,
      status: childsStatus,
      developmental_difficulties: selectedDevelopmentalDifficulties.map(
        (difficulty) => Number(difficulty.id)
      ),
      family_model: childsFamilyModel,
      mentoring_reason: selectedMentoringReasons.map((reason) =>
        Number(reason.id)
      ),
      guardian_consent: childsGuardianConsent,
      vaccination_status: vaccinationStatus,
      health_difficulties: healthDifficulties,
      something_else: somethingElseTextBox,
      active_pup: activePUP,
      passive_pup: passivePUP,
      child_potential: childPotential,
      volunteer:
        childsVolunteer && childsVolunteer.length > 0
          ? childsVolunteer[0].id
          : undefined,
      coordinator:
        childsCoordinator && childsCoordinator.length > 0
          ? childsCoordinator[0].id
          : undefined,
    };
  };

  const shouldDisableForm = () => {
    if (hasAdminGroup(userGroups) || hasCoordinatorGroup(userGroups)) {
      return false;
    }
    return true;
  };

  const enableSubmitButton = () => {
    return (
      checkMentoringReasonValidity() &&
      checkDevelopmentalDifficultyValidity() &&
      childsCode &&
      childsBirthDate &&
      childsGender &&
      childSchoolStatus !== undefined &&
      childSchoolStatus &&
      childsFamilyModel &&
      childsGuardianConsent !== undefined &&
      childsDevelopmentalDifficulties &&
      selectedMentoringReasons &&
      ((childOrganisation &&
        childOrganisation.length > 0 &&
        childCity &&
        childCity.length > 0 &&
        childsCoordinator &&
        childsCoordinator.length > 0) ||
        hasCoordinatorGroup(userGroups)) &&
      checkHealthDifficulties() &&
      checkActivePUP() &&
      checkPassivePUP()
    );
  };

  const checkMentoringReasonValidity = () => {
    return (
      selectedMentoringReasons &&
      selectedMentoringReasons.length > 0 &&
      selectedMentoringReasons.length <= 5
    );
  };

  const checkDevelopmentalDifficultyValidity = () => {
    return (
      selectedDevelopmentalDifficulties &&
      selectedDevelopmentalDifficulties.length > 0
    );
  };

  const checkHealthDifficulties = () => {
    const isHealthDifficultiesChecked = selectedDevelopmentalDifficulties.find(
      (difficulty) => difficulty.id === 14
    );
    return (
      !isHealthDifficultiesChecked ||
      (isHealthDifficultiesChecked && healthDifficulties?.length)
    );
  };

  const onHealthDifficultiesChange = (event) => {
    setHealthDifficulties(event.target.value);
  };

  const onChildPotentialChange = (event) => {
    setChildPotential(event.target.value);
  };

  const checkActivePUP = () => {
    const isActivePUPChecked = selectedMentoringReasons.find(
      (difficulty) => difficulty.id === 26
    );
    return !isActivePUPChecked || (isActivePUPChecked && activePUP?.length);
  };

  const onActivePUPChange = (event) => {
    setActvePUP(event.target.value);
  };

  const checkPassivePUP = () => {
    const isPassivePUPChecked = selectedMentoringReasons.find(
      (difficulty) => difficulty.id === 25
    );
    return !isPassivePUPChecked || (isPassivePUPChecked && passivePUP?.length);
  };

  const onPassivePUPChange = (event) => {
    setPassivePUP(event.target.value);
  };

  const onSomethingElseChange = (event) => {
    setSomethingElseTextBox(event.target.value);
  };

  if (authenticate && !hasVolunteerGroup(userGroups)) {
    return (
      <div>
        {location.state.selectedChild ? <h1>Dijete</h1> : <h1>Dodaj dijete</h1>}

        <div className="formDiv">
          <label className="title">Kod</label>
          <input
            type="text"
            value={childsCode}
            onChange={(e) => setChildsCode(e.target.value)}
            disabled={location.state.selectedChild}
          />
        </div>

        <div className="formDiv">
          <label className="title dateSpan">Datum rođenja:</label>
          <DatePicker
            render={
              <InputIcon
                className={"dateInput " + (!isDateValid ? "invalid-email" : "")}
                value={dateInput}
                onChange={onDateInputChange}
                disabled={shouldDisableForm()}
              />
            }
            onChange={onDateChange}
            value={childsBirthDate}
            months={months}
            weekDays={days}
            format="DD.MM.YYYY"
            weekStartDayIndex={1}
            required={true}
            maxDate={currentDate}
            disabled={shouldDisableForm()}
          />
          <span className="title ageSpan">Starost djeteta:</span>
          <span className="ageSpan">{childsAge} godina</span>
        </div>
        <div className="formDiv">
          <span className="title">Spol</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Muški"
                name="gender"
                checked={childsGender === "Muški"}
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
                checked={childsGender === "Ženski"}
                onChange={onGenderChange}
                disabled={isEditMode}
              />
              <label>Ženski</label>
            </div>
          </div>
        </div>
        {hasAdminGroup(userGroups) ? (
          <div>
            <label className="title">Organizacija</label>
            <Select
              values={childOrganisation}
              options={organisations}
              onChange={(values) => onOrganisationChange(values)}
              placeholder="Organizacija"
              valueField="id"
              labelField="name"
            />

            <label className="title">Grad</label>
            <Select
              options={cities}
              values={childCity}
              onChange={(values) => onCityChange(values)}
              placeholder="Grad"
              valueField="id"
              labelField="name"
              disabled={!childOrganisation}
            />

            <label className="title">Koordinator</label>
            <Select
              values={childsCoordinator}
              options={coordinators}
              onChange={(values) => onCoordinatorChange(values)}
              placeholder="Koordinator"
              valueField="id"
              labelField="name"
              disabled={!childOrganisation || !childCity}
            />
          </div>
        ) : null}
        <label className="title">Volonter</label>

        <Select
          values={childsVolunteer}
          options={volunteers}
          onChange={(values) => onChildsVolunteerChange(values)}
          placeholder="Volonter"
          valueField="id"
          labelField="name"
          disabled={
            (hasAdminGroup(userGroups) && !childsCoordinator) || !childsGender
          }
        />

        <div className="formDiv">
          <span className="title">Status u programu</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Dijete prvi put učestvuje u programu"
                name="status"
                checked={
                  childsStatus === "Dijete prvi put učestvuje u programu"
                }
                onChange={onStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Dijete prvi put učestvuje u programu</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Dijete je i ranije učestvovalo u programu i nastavlja sa starim volonterom/kom"
                name="status"
                checked={
                  childsStatus ===
                  "Dijete je i ranije učestvovalo u programu i nastavlja sa starim volonterom/kom"
                }
                onChange={onStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Dijete je i ranije učestvovalo u programu i nastavlja sa starim
                volonterom/kom
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Dijete je i ranije učestvovalo u programu i nastavlja sa novim volonterom/kom"
                name="status"
                checked={
                  childsStatus ===
                  "Dijete je i ranije učestvovalo u programu i nastavlja sa novim volonterom/kom"
                }
                onChange={onStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>
                Dijete je i ranije učestvovalo u programu i nastavlja sa novim
                volonterom/kom
              </label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Dijete nije aktivno uključeno u program"
                name="status"
                checked={
                  childsStatus === "Dijete nije aktivno uključeno u program"
                }
                onChange={onStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Dijete nije aktivno uključeno u program</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span className="title">Saglasnost skrbnika</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="guardian_consent"
                checked={childsGuardianConsent}
                onChange={onGuardianConsentChange}
                disabled={shouldDisableForm()}
              />
              <label>Posjeduje</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value={false}
                name="guardian_consent"
                checked={!childsGuardianConsent}
                onChange={onGuardianConsentChange}
                disabled={shouldDisableForm()}
              />
              <label>Ne posjeduje</label>
            </div>
          </div>
        </div>

        <div className="formDiv">
          <span className="title">Da li je dijete redovno vakcinisano?</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="vaccination_status"
                checked={vaccinationStatus}
                onChange={onVaccinationStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Da</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value={false}
                name="vaccination_status"
                checked={!vaccinationStatus}
                onChange={onVaccinationStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Ne</label>
            </div>
          </div>
        </div>

        <div className="formDiv">
          <span className="title">Porodični status djeteta</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Potpuna porodica"
                name="family_model"
                checked={childsFamilyModel === "Potpuna porodica"}
                onChange={onFamilyModelChange}
                disabled={shouldDisableForm()}
              />
              <label>Potpuna porodica</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Jednoroditeljska/nepotpuna porodica"
                name="family_model"
                checked={
                  childsFamilyModel === "Jednoroditeljska/nepotpuna porodica"
                }
                onChange={onFamilyModelChange}
                disabled={shouldDisableForm()}
              />
              <label>Jednoroditeljska/nepotpuna porodica</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Skrbnici/hranitelji"
                name="family_model"
                checked={childsFamilyModel === "Skrbnici/hranitelji"}
                onChange={onFamilyModelChange}
                disabled={shouldDisableForm()}
              />
              <label>Skrbnici/hranitelji</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Institucija"
                name="family_model"
                checked={childsFamilyModel === "Institucija"}
                onChange={onFamilyModelChange}
                disabled={shouldDisableForm()}
              />
              <label>Živi u instituciji</label>
            </div>
          </div>
        </div>

        <div className="formDiv">
          <span className="title">Obrazovni status djeteta</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Pohađa"
                name="school_status"
                checked={childSchoolStatus === "Pohađa"}
                onChange={onSchoolStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Pohađa školu</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Pohađa po prilagođenom programu"
                name="school_status"
                checked={
                  childSchoolStatus === "Pohađa po prilagođenom programu"
                }
                onChange={onSchoolStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Pohađa školu po prilagođenom programu</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Pohađa specijalno obrazovanje"
                name="school_status"
                checked={childSchoolStatus === "Pohađa specijalno obrazovanje"}
                onChange={onSchoolStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Pohađa specijalno obrazovanje</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Ne pohađa"
                name="school_status"
                checked={childSchoolStatus === "Ne pohađa"}
                onChange={onSchoolStatusChange}
                disabled={shouldDisableForm()}
              />
              <label>Ne pohađa školu</label>
            </div>
          </div>
        </div>

        <div className="formDiv">
          <span className="title">Specifičnosti u razvoju djeteta</span>
          {developmentalDifficulties.map((item) => {
            return (
              <div className="checkBoxes" key={item.id}>
                <input
                  type="checkbox"
                  value={item.id}
                  checked={hasDevelopmentalDifficulty(item)}
                  onChange={onDifficultyChange}
                  disabled={shouldDisableForm()}
                />
                <label>{item.name}</label>
              </div>
            );
          })}
          {showHealthDifficultiesTextbox ? (
            <div className="formDiv">
              <span className="title">Zdravstvene poteškoće djeteta</span>
              <textarea
                rows="2"
                value={healthDifficulties}
                onChange={onHealthDifficultiesChange}
              />
            </div>
          ) : null}
          {!checkHealthDifficulties() && (
            <span className="invalid-developmental-difficulty">
              Navedite koje zdravstvene poteškoće dijete ima.
            </span>
          )}
          {!checkDevelopmentalDifficultyValidity() && (
            <span className="invalid-developmental-difficulty">
              Mora biti izabrana barem jedna opcija!
            </span>
          )}
        </div>
        <div className="formDiv">
          <span className="title">Razlozi uključivanja djeteta u program</span>
          <div className="mentoringReasonCategoryDiv">
            {mentoringReasonCategories.map((category) => {
              return (
                <div key={category.id}>
                  <label className="categoryTitle">{category.name}</label>
                  {mentoringReasons.map((mentoringReason) => {
                    if (mentoringReason.category.name === category.name) {
                      return (
                        <div className="checkBoxes" key={mentoringReason.id}>
                          <input
                            type="checkbox"
                            value={mentoringReason.id}
                            checked={hasMentoringReason(mentoringReason)}
                            onChange={onMentoringReasonChange}
                            disabled={shouldDisableForm()}
                          />
                          <label>{mentoringReason.name}</label>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
          {showSomethingElseTextBox ? (
            <div className="formDiv">
              <span className="title">Nešto drugo</span>
              <textarea
                rows="2"
                placeholder="Navedite druge razloge uključivanja djeteta u program"
                value={somethingElseTextBox}
                onChange={onSomethingElseChange}
              />
            </div>
          ) : null}
          {showActivePUPTextbox ? (
            <div>
              <span className="title">Aktivni PUP</span>
              <textarea
                rows="2"
                placeholder="Navedite aktivne PUP kod djeteta"
                value={activePUP}
                onChange={onActivePUPChange}
              />
            </div>
          ) : null}
          {!checkActivePUP() && (
            <span className="invalid-developmental-difficulty">
              Navedite koje aktivne PUP dijete ima.
            </span>
          )}
          {showPassivePUPTextbox ? (
            <div>
              <span className="title">Pasivni PUP</span>
              <textarea
                rows="2"
                placeholder="Navedite pasivne PUP kod djeteta"
                value={passivePUP}
                onChange={onPassivePUPChange}
              />
            </div>
          ) : null}
          {!checkPassivePUP() && (
            <span className="invalid-developmental-difficulty">
              Navedite koje pasivne PUP dijete ima.
            </span>
          )}
          <div className="moreInfoDiv">
            <span>
              *Faktor pasivnih oblika poremećaja u ponašanju: tikovi,
              plašljivost, povučenost, potištenost, rastresenost i razmaženost.
            </span>
            <span>
              **Faktor aktivnih oblika poremećaja u ponašanju: nemarnost,
              neurednost, nediscipliniranost za vrijeme nastave, prkos, laganje,
              psovanje, sudjelovanje u tučnjavama, pušenje, pijenje alkoholnih
              pića, neopravdano izostajanje sa nastave, bježanje od kuće,
              skitnja i činjenje imovinskih delikata.
            </span>
          </div>
          {!checkMentoringReasonValidity() && (
            <span className="invalid-mentoring-reason">
              Izaberite najmanje jednu, a najviše 5 opcija!
            </span>
          )}
          <div className="formDiv childPotentialDiv">
            <span className="title">Očuvani potencijali djeteta</span>
            <textarea
              rows="2"
              value={childPotential}
              onChange={onChildPotentialChange}
            />
          </div>
        </div>

        <div className="buttons">
          {shouldDisableForm() ? null : (
            <div>
              {!isEditMode ? (
                <Button
                  className="submitButton"
                  type="submit"
                  style={{ borderRadius: "0%" }}
                  onClick={addChild}
                  disabled={!enableSubmitButton()}
                >
                  Potvrdi
                </Button>
              ) : (
                <Button
                  className="submitButton"
                  type="submit"
                  style={{ borderRadius: "0%" }}
                  onClick={updateChild}
                  disabled={!enableSubmitButton()}
                >
                  Izmijeni
                </Button>
              )}
            </div>
          )}
          <Button
            variant="secondary"
            style={{ borderRadius: "0%" }}
            onClick={navigateToChilds}
          >
            Zatvori
          </Button>
        </div>
      </div>
    );
  }
  return null;
}

export default ChildDetails;
