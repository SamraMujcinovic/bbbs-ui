import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";
import TimePicker from "react-time-picker";

import { useLocation, useNavigate } from "react-router-dom";

import { dateToString, days, months, stringToDate } from "../utilis/Date";
import { numberToTimeString, timeStringToNumber } from "../utilis/Time";
import {
  countWords,
  escapeInput,
  hasAdminGroup,
  hasVolunteerGroup,
} from "../utilis/ServiceUtil";

import "../form/Form.css";

function FormDetails(props) {
  // authenticate
  const authenticate = sessionStorage.getItem("token");
  const userRoles = sessionStorage.getItem("roles");

  // navigation
  let navigate = useNavigate();

  const navigateToForms = () => {
    let path = `/forms`;
    navigate(path);
  };

  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());

  // form details
  const [formDate, setFormDate] = useState(new Date());
  const [formDuration, setFormDuration] = useState("01:30");
  const [formActivityType, setFormActivityType] = useState("Individualno");
  const [formPlace, setFormPlace] = useState([]);
  const [formEvaluation, setFormEvaluation] = useState("Super");
  const [formActivities, setFormActivities] = useState([]);
  const [formDescription, setFormDescription] = useState("");
  const [formVolunteer, setFormVolunteer] = useState("");

  // data to select
  const [hangOutPlaces, setHangOutPlaces] = useState([]);
  const [selectedHangOutPlaces, setSelectedHangOutPlaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [activityCategories, setActivityCategoriees] = useState([]);

  // validations
  const [dateInput, setDateInput] = useState("");
  const [isDateValid, setIsDateValid] = useState(true);

  useEffect(() => {
    if (location.state.selectedForm) {
      setIsEditMode(true);
      getForm(location.state.selectedForm.id);
    }
    getHangOutPlaces();
    getActivities();
    getActivityCategories();
  }, []);

  const getForm = async (id) => {
    await axios
      .get(`http://localhost:8000/forms/${id}/`, {
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

  // set initial data (if form is selected)
  const setInitialData = (selectedForm) => {
    setFormDate(stringToDate(selectedForm.date));
    setFormDuration(numberToTimeString(selectedForm.duration));
    setFormActivityType(selectedForm.activity_type);
    setSelectedHangOutPlaces(selectedForm.place);
    setFormEvaluation(selectedForm.evaluation);
    setSelectedActivities(selectedForm.activities);
    if (selectedForm.description) {
      setFormDescription(selectedForm.description);
    }
    setFormVolunteer(selectedForm.volunteer);
  };

  const getHangOutPlaces = async () => {
    await axios
      .get(`http://localhost:8000/places/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setHangOutPlaces(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getActivities = async () => {
    await axios
      .get(`http://localhost:8000/activities/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setActivities(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getActivityCategories = async () => {
    await axios
      .get(`http://localhost:8000/activity-categories/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setActivityCategoriees(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onDurationChange = (duration) => {
    setFormDuration(duration);
  };

  const onDescriptionChange = (event) => {
    setFormDescription(event.target.value);
  };

  const onActivityTypeChange = (event) => {
    setFormActivityType(str2bool(event.target.value));
  };

  const onEvaluationChange = (event) => {
    setFormEvaluation(str2bool(event.target.value));
  };

  var str2bool = (value) => {
    // need this conversion because of radio button true/false values
    if (value && typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return value;
  };

  const onPlaceChange = (event) => {
    const selectedPlace = hangOutPlaces.filter(
      (place) => place.id === Number(event.target.value)
    )[0];

    if (hasPlace(selectedPlace)) {
      // if already exist => deselect that place
      setSelectedHangOutPlaces(
        selectedHangOutPlaces.filter((place) => {
          return place.id !== selectedPlace.id;
        })
      );
    } else {
      setSelectedHangOutPlaces([...selectedHangOutPlaces, selectedPlace]);
    }
  };

  const hasPlace = (place) => {
    return (
      selectedHangOutPlaces?.filter((value) => {
        return value.id === place.id;
      }).length > 0
    );
  };

  const onActivityChange = (event) => {
    const selectedActivity = activities.filter(
      (activity) => activity.id === Number(event.target.value)
    )[0];

    if (hasActivity(selectedActivity)) {
      // if already exist => deselect that activity
      setSelectedActivities(
        selectedActivities.filter((activity) => {
          return activity.id !== selectedActivity.id;
        })
      );
    } else {
      setSelectedActivities([...selectedActivities, selectedActivity]);
    }
  };

  const hasActivity = (activity) => {
    return (
      selectedActivities?.filter((value) => {
        return value.id === activity.id;
      }).length > 0
    );
  };

  const addForm = async () => {
    await axios
      .post("http://localhost:8000/forms/", getSelectedValues(), {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then(() => navigateToForms())
      .catch((error) => {
        console.log(error);
      });
  };

  const getSelectedValues = () => {
    return {
      date: dateToString(formDate),
      duration: timeStringToNumber(formDuration),
      activity_type: formActivityType,
      place: selectedHangOutPlaces.map((place) => Number(place.id)),
      evaluation: formEvaluation,
      activities: selectedActivities.map((activity) => Number(activity.id)),
      description: formDescription.trim() === "" ? null : formDescription,
    };
  };

  const onDateChange = (date) => {
    setFormDate(new Date(date));
    setIsDateValid(checkDateValidity(date));
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

  const shouldDisableForm = () => {
    // disable editing forms for all roles!
    if (hasVolunteerGroup(userRoles) && !isEditMode) {
      return false;
    }
    return true;
  };

  const isFormValid = () => {
    return (
      isDateValid &&
      timeStringToNumber(formDuration) &&
      checkHangOutPlacesValidity() &&
      checkActivitiesValidity() &&
      checkDescriptionValidity()
    );
  };

  const checkHangOutPlacesValidity = () => {
    return (
      selectedHangOutPlaces &&
      selectedHangOutPlaces.length > 0 &&
      selectedHangOutPlaces.length < 4
    );
  };

  const checkHangOutPlacesSelectedOptions = () => {
    return (
      selectedHangOutPlaces &&
      (selectedHangOutPlaces.filter((value) => value.name === "Ostalo")
        .length === 0 ||
        (formDescription && formDescription.trim() !== ""))
    );
  };

  const checkActivitiesValidity = () => {
    return (
      selectedActivities &&
      selectedActivities.length > 0 &&
      selectedActivities.length < 7
    );
  };

  const checkDescriptionValidity = () => {
    return formDescription === "" || countWords(formDescription) > 50;
  };

  if (authenticate) {
    return (
      <div>
        {location.state.selectedForm ? <h1>Forma</h1> : <h1>Dodaj formu</h1>}
        {formVolunteer ? (
          <div>
            <span className="title">Volonter:</span>
            <input
              value={`${formVolunteer.user.first_name} ${formVolunteer.user.last_name}`}
              disabled={true}
            />
          </div>
        ) : null}
        <div className="dateTimeDiv">
          <div>
            <span className="title dateSpan">Datum: </span>
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
              value={formDate}
              months={months}
              weekDays={days}
              format="DD.MM.YYYY"
              weekStartDayIndex={1}
              required={true}
              maxDate={currentDate}
              disabled={shouldDisableForm()}
            />
          </div>
          <div>
            <span className="title timeSpan">Trajanje:</span>
            <TimePicker
              className={
                "time-picker " +
                (timeStringToNumber(formDuration) === 0
                  ? "invalid-duration"
                  : "")
              }
              clearIcon={null}
              clockIcon={null}
              format="HH:mm"
              disableClock={true}
              amPmAriaLabel=""
              onChange={onDurationChange}
              value={formDuration}
              disabled={shouldDisableForm()}
            />
          </div>
        </div>
        <div className="formDiv">
          <span className="title">Vrsta druženja</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Individualno"
                name="activity_type"
                checked={formActivityType === "Individualno"}
                onChange={onActivityTypeChange}
                disabled={shouldDisableForm()}
              />
              <label>Individualno</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Druženje sa drugim parovima"
                name="activity_type"
                checked={formActivityType === "Druženje sa drugim parovima"}
                onChange={onActivityTypeChange}
                disabled={shouldDisableForm()}
              />
              <label>Druženje sa drugim parovima</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Grupna aktivnost"
                name="activity_type"
                checked={formActivityType === "Grupna aktivnost"}
                onChange={onActivityTypeChange}
                disabled={shouldDisableForm()}
              />
              <label>Grupna aktivnost</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span className="title">Ocjena</span>
          <div className="radioButtonsDiv">
            <div className="radioButtons">
              <input
                type="radio"
                value="Super"
                name="evaluation"
                checked={formEvaluation === "Super"}
                onChange={onEvaluationChange}
                disabled={shouldDisableForm()}
              />
              <label>Super</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Dobro"
                name="evaluation"
                checked={formEvaluation === "Dobro"}
                onChange={onEvaluationChange}
                disabled={shouldDisableForm()}
              />
              <label>Dobro</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Nije loše"
                name="evaluation"
                checked={formEvaluation === "Nije loše"}
                onChange={onEvaluationChange}
                disabled={shouldDisableForm()}
              />
              <label>Nije loše</label>
            </div>
            <div className="radioButtons">
              <input
                type="radio"
                value="Loše"
                name="evaluation"
                checked={formEvaluation === "Loše"}
                onChange={onEvaluationChange}
                disabled={shouldDisableForm()}
              />
              <label>Loše</label>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <span className="title">Mjesto druženja</span>
          {hangOutPlaces.map((item) => {
            return (
              <div className="checkBoxes" key={item.id}>
                <input
                  type="checkbox"
                  value={item.id}
                  checked={hasPlace(item)}
                  onChange={onPlaceChange}
                  disabled={shouldDisableForm()}
                />
                <label>{item.name}</label>
              </div>
            );
          })}
          {!checkHangOutPlacesValidity() && (
            <span className="invalid-place">
              Izaberite minimalno jednu, a maksimalno 3 opcije!
            </span>
          )}
          {!checkHangOutPlacesSelectedOptions() && (
            <span className="invalid-place">
              Ako je izabrana opcija "Ostalo", obavezni ste da opišete druženje
              u polju "Opis"!
            </span>
          )}
        </div>
        <div className="formDiv">
          <span className="title">
            Oblasti na koje su bile usmjerene aktivnosti
          </span>
          <div className="activityCategoryDiv">
            {activityCategories.map((category) => {
              return (
                <div key={category.id}>
                  <label className="categoryTitle">{category.name}</label>
                  {activities.map((activity) => {
                    if (activity.activity_category.name === category.name) {
                      return (
                        <div className="checkBoxes" key={activity.id}>
                          <input
                            type="checkbox"
                            value={activity.id}
                            checked={hasActivity(activity)}
                            onChange={onActivityChange}
                            disabled={shouldDisableForm()}
                          />
                          <label>{activity.name}</label>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
          {!checkActivitiesValidity() && (
            <span className="invalid-activity">
              Izaberite minimalno jednu, a maksimalno 6 opcija!
            </span>
          )}
        </div>
        <div className="formDiv">
          <span className="title">Opis druženja</span>
          <textarea
            className={
              "" +
              (!checkHangOutPlacesSelectedOptions() ||
              !checkDescriptionValidity()
                ? "invalid-description"
                : "")
            }
            rows="5"
            value={formDescription}
            onChange={onDescriptionChange}
          />
          {!checkDescriptionValidity() && (
            <span>Opisite druženje u MINIMALNO 50 riječi!</span>
          )}
        </div>
        {shouldDisableForm() ? null : (
          <Button
            type="submit"
            className="submitButton"
            onClick={addForm}
            disabled={!isFormValid()}
          >
            Potvrdi
          </Button>
        )}
        <Button variant="secondary" onClick={navigateToForms}>
          Zatvori
        </Button>
      </div>
    );
  }
  return null;
}

export default FormDetails;
