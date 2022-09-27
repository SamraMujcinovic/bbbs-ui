import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Select from "react-dropdown-select";
import { useLocation, useNavigate } from "react-router-dom";
import { hasAdminGroup, hasCoordinatorGroup } from "../utilis/ServiceUtil";

import "../child/Child.css";
import { UserAuthenticated } from "../globalStates/AuthenticateContext";
import { UserGroups } from "../globalStates/UserGroups";

function ChildDetails() {
  // authenticate
  const [authenticate, setAuthenticate] = useContext(UserAuthenticated);
  const [userGroups] = useContext(UserGroups);

  // navigation
  let navigate = useNavigate();

  const navigateToChilds = () => {
    let path = `/childs`;
    navigate(path);
  };

  const location = useLocation();

  // child details
  const [childsFirstName, setChildsFirstName] = useState("");
  const [childsLastName, setChildsLastName] = useState("");
  const [childsCode, setChildsCode] = useState("");
  const [childsGender, setChildsGender] = useState("Muški");
  const [childsBirthYear, setChildsBirthYear] = useState(undefined);
  const [yearsToSelect, setYearsToSelect] = useState([]);

  const [childSchoolStatus, setChildsSchoolStatus] = useState("Pohađa");
  const [childsFamilyModel, setChildsFamilyModel] = useState(
    "Potpuna porodica"
  );
  const [childsStatus, setChildsStatus] = useState(false);
  const [childsVolunteer, setChildsVolunteer] = useState(undefined);
  const [childsCoordinator, setChildsCoordinator] = useState(undefined);
  const [childsGuardianConsent, setChildsGuardianConsent] = useState(false);
  const [childOrganisation, setChildsOrganisation] = useState();
  const [childCity, setChildsCity] = useState();

  const [childsMentoringReason, setChildMentoringReason] = useState([]);
  const [
    childsDevelopmentalDifficulties,
    setChildsDevelopmentalDifficulties,
  ] = useState([]);

  // data to select
  const [coordinators, setCoordinators] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [developmentalDifficulties, setDevelopmentalDifficulties] = useState(
    []
  );
  const [mentoringReasons, setMentoringReasons] = useState([]);
  const [mentoringReasonCategories, setMentoringReasonCategories] = useState(
    []
  );

  // data represented in edit mode
  const [childsVolunteerInput, setChildsVolunteerInput] = useState("");

  useEffect(() => {
    setYearsToSelect(createYearsArray());
    getMentoringReasons();
    getMentoringReasonCategories();
    getDevelopmentalDifficulties();
    if (location.state.selectedChild) {
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
        childsCoordinator[0].id
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

  // data to select
  const createYearsArray = () => {
    const currentYear = new Date().getFullYear();
    let i = currentYear;
    let years = [];
    while (i >= currentYear - 20) {
      years.push({
        label: i,
        value: i,
      });
      i--;
    }

    return years;
  };

  // APIs

  const getCoordinators = async () => {
    await axios
      .get(`http://localhost:8000/coordinators/`, {
        params: {
          organisation: childOrganisation[0].id,
          city: childCity[0].id,
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

  const getVolunteers = async (organisation, city, coordinator) => {
    await axios
      .get(`http://localhost:8000/volunteers/`, {
        params: {
          organisation: organisation,
          city: city,
          coordinator: coordinator,
          gender: getChildsGender(),
          status: "False",
        },
        withCredentials: true,
      })
      .then((response) => {
        setVolunteers(response.data.map(covertToVolunteerData));
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
    };
  };

  const getMentoringReasons = async () => {
    await axios
      .get("http://localhost:8000/mentoring-reasons/", {
        withCredentials: true,
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
      .get("http://localhost:8000/mentoring-reasons-categories/", {
        withCredentials: true,
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
      .get("http://localhost:8000/developmental-difficulties/", {
        withCredentials: true,
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
      .get(`http://localhost:8000/childs/${id}/`, {
        withCredentials: true,
      })
      .then((response) => {
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
    setChildsBirthYear(
      createYearsArray().filter((year) => {
        return year.value === selectedChild.birth_year;
      })
    );
    setChildsSchoolStatus(selectedChild.school_status);
    setChildsFamilyModel(selectedChild.family_model);
    setChildsStatus(selectedChild.status);
    setChildsGuardianConsent(selectedChild.guardian_consent);
    setChildsCoordinator(selectedChild.coordinator);
    setChildsVolunteer(selectedChild.volunteer);
    if (selectedChild.volunteer) {
      setChildsVolunteerInput(
        `${selectedChild.volunteer.user.first_name} ${selectedChild.volunteer.user.last_name}`
      );
    }

    setChildsDevelopmentalDifficulties(
      selectedChild.developmental_difficulties
    );
    setChildMentoringReason(selectedChild.mentoring_reason);
    setChildsOrganisation(selectedChild.child_organisation);
    setChildsCity(selectedChild.child_city);
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
    setChildsStatus(str2bool(event.target.value));
  };

  const onGuardianConsentChange = (event) => {
    setChildsGuardianConsent(str2bool(event.target.value));
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
    setChildsDevelopmentalDifficulties([
      ...childsDevelopmentalDifficulties,
      Number(event.target.value),
    ]);
  };

  const hasDevelopmentalDifficulty = (difficulty) => {
    return childsDevelopmentalDifficulties.some((value) => {
      if (value.id) {
        return value.id == difficulty.id;
      }
      return value == difficulty.id;
    });
  };

  const onMentoringReasonChange = (event) => {
    setChildMentoringReason([
      ...childsMentoringReason,
      Number(event.target.value),
    ]);
  };

  const hasMentoringReason = (reason) => {
    return childsMentoringReason.some((value) => {
      if (value.id) {
        return value.id == reason.id;
      }
      return value == reason.id;
    });
  };

  const onCoordinatorChange = (event) => {
    setChildsCoordinator(event);
    setChildsVolunteer(undefined);
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

  const getChildsGender = () => {
    if (childsGender === "Muški") {
      return "M";
    } else if (childsGender === "Ženski") {
      return "Z";
    }
    return "N";
  };

  const getSelectedValues = () => {
    return {
      first_name: childsFirstName,
      last_name: childsLastName,
      gender: childsGender,
      birth_year: childsBirthYear[0].value,
      school_status: childSchoolStatus,
      developmental_difficulties: childsDevelopmentalDifficulties,
      family_model: childsFamilyModel,
      mentoring_reason: childsMentoringReason,
      guardian_consent: childsGuardianConsent,
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

  const addChild = async () => {
    await axios
      .post("http://localhost:8000/childs/", getSelectedValues(), {
        withCredentials: true,
      })
      .then(() => navigateToChilds())
      .catch((error) => {
        console.log(error);
      });
  };

  if (authenticate) {
    return (
      <div>
        <h1>Dodaj dijete</h1>

        {location.state.selectedChild ? (
          <div className="formDiv">
            <label>Kod</label>
            <input type="text" disabled={true} value={childsCode} />
          </div>
        ) : null}
        {location.state.selectedChild ? null : (
          <div className="formDiv">
            <label>Ime</label>
            <input
              type="text"
              value={childsFirstName}
              onChange={(e) => setChildsFirstName(e.target.value)}
            />
          </div>
        )}
        {location.state.selectedChild ? null : (
          <div className="formDiv">
            <label>Prezime</label>
            <input
              type="text"
              value={childsLastName}
              onChange={(e) => setChildsLastName(e.target.value)}
            />
          </div>
        )}
        <label>Godina rođenja</label>
        <Select
          values={childsBirthYear}
          options={yearsToSelect}
          onChange={(values) => setChildsBirthYear(values)}
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
                checked={childsGender === "Muški"}
                onChange={onGenderChange}
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
              />
              <label>Ženski</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Ostali"
                name="gender"
                checked={childsGender === "Ostali"}
                onChange={onGenderChange}
              />
              <label>Ostali</label>
            </div>
          </div>
        </div>
        {hasAdminGroup(userGroups) ? (
          <div>
            <label>Organizacija</label>
            <Select
              values={childOrganisation}
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
              values={childCity}
              onChange={(values) => onCityChange(values)}
              placeholder="Grad"
              valueField="id"
              labelField="name"
              disabled={location.state.isEditMode}
            />

            <label>Koordinator</label>
            <Select
              values={childsCoordinator}
              options={coordinators}
              onChange={(values) => onCoordinatorChange(values)}
              placeholder="Koordinator"
              valueField="id"
              labelField="name"
              disabled={
                !childOrganisation || !childCity || location.state.isEditMode
              }
            />
          </div>
        ) : null}
        <label>Volonter</label>
        {location.state.isEditMode ? (
          <div className="formDiv">
            <input type="text" value={childsVolunteerInput} disabled={true} />
          </div>
        ) : (
          <Select
            values={childsVolunteer}
            options={volunteers}
            onChange={(values) => setChildsVolunteer(values)}
            placeholder="Volonter"
            valueField="id"
            labelField="name"
            disabled={
              (hasAdminGroup(userGroups) && !childsCoordinator) || !childsGender
            }
          />
        )}
        <div className="formDiv">
          <span>Škola</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Pohađa"
                name="school_status"
                checked={childSchoolStatus === "Pohađa"}
                onChange={onSchoolStatusChange}
              />
              <label>Pohađa</label>
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
              />
              <label>Pohađa po prilagođenom programu</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Pohađa specijalno obrazovanje"
                name="school_status"
                checked={childSchoolStatus === "Pohađa specijalno obrazovanje"}
                onChange={onSchoolStatusChange}
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
              />
              <label>Ne pohađa</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span>Sa kim dijete živi?</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Potpuna porodica"
                name="family_model"
                checked={childsFamilyModel === "Potpuna porodica"}
                onChange={onFamilyModelChange}
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
              />
              <label>Institucija</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span>Status u programu</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="status"
                checked={childsStatus}
                onChange={onStatusChange}
              />
              <label>Aktivan</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value={false}
                name="status"
                checked={!childsStatus}
                onChange={onStatusChange}
              />
              <label>Neaktivan</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span>Saglasnost skrbnika</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value={true}
                name="guardian_consent"
                checked={childsGuardianConsent}
                onChange={onGuardianConsentChange}
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
              />
              <label>Ne posjeduje</label>
            </div>
          </div>
        </div>

        <div className="formDiv">
          <span>Poteškoće u razvoju</span>
          {developmentalDifficulties.map((item) => {
            return (
              <div className="checkBoxes" key={item.id}>
                <input
                  type="checkbox"
                  value={item.id}
                  checked={hasDevelopmentalDifficulty(item)}
                  onChange={onDifficultyChange}
                />
                <label>{item.name}</label>
              </div>
            );
          })}
        </div>
        <div className="formDiv">
          <span>Razlog mentorstva</span>
          {mentoringReasonCategories.map((category) => {
            return (
              <div key={category.id}>
                <label>{category.name}</label>
                {mentoringReasons.map((mentoringReason) => {
                  if (mentoringReason.category.name === category.name) {
                    return (
                      <div className="checkBoxes" key={mentoringReason.id}>
                        <input
                          type="checkbox"
                          value={mentoringReason.id}
                          checked={hasMentoringReason(mentoringReason)}
                          onChange={onMentoringReasonChange}
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

        <Button type="submit" onClick={addChild}>
          Submit
        </Button>
        <Button variant="secondary" onClick={navigateToChilds}>
          Close
        </Button>
      </div>
    );
  }
  return null;
}

export default ChildDetails;
