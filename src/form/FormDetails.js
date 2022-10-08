import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import DatePicker from "react-date-picker";
import TimePicker from "react-time-picker";
import { useLocation, useNavigate } from "react-router-dom";

import { dateToString, stringToDate } from "../utilis/Date";
import { numberToTimeString, timeStringToNumber } from "../utilis/Time";
import { hasAdminGroup, hasVolunteerGroup } from "../utilis/ServiceUtil";

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
  const [activities, setActivities] = useState([]);
  const [activityCategories, setActivityCategoriees] = useState([]);

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
    setFormPlace(selectedForm.place);
    setFormEvaluation(selectedForm.evaluation);
    setFormActivities(selectedForm.activities);
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
    setFormPlace([...formPlace, Number(event.target.value)]);
  };

  const hasPlace = (place) => {
    return formPlace.some((value) => {
      if (value.id) {
        return value.id === place.id;
      }
      return value === place.id;
    });
  };

  const onActivityChange = (event) => {
    setFormActivities([...formActivities, Number(event.target.value)]);
  };

  const hasActivity = (activity) => {
    return formActivities.some((value) => {
      if (value.id) {
        return value.id === activity.id;
      }
      return value === activity.id;
    });
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
      place: formPlace,
      evaluation: formEvaluation,
      activities: formActivities,
      description: formDescription.trim() === "" ? null : formDescription,
    };
  };

  const shouldDisableForm = () => {
    if (
      (hasVolunteerGroup(userRoles) && !isEditMode) ||
      hasAdminGroup(userRoles)
    ) {
      return false;
    }
    return true;
  };

  if (authenticate) {
    return (
      <div>
        {location.state.selectedForm ? <h1>Forma</h1> : <h1>Dodaj formu</h1>}
        {formVolunteer ? (
          <div>
            <span>Volonter:</span>
            <input
              value={`${formVolunteer.user.first_name} ${formVolunteer.user.last_name}`}
              disabled={true}
            />
          </div>
        ) : null}
        <div>
          <div>
            <span>Datum: </span>
            <DatePicker
              onChange={(date) => setFormDate(date)}
              value={formDate}
              locale="de-DE"
              clearIcon={null}
              disabled={shouldDisableForm()}
            />
          </div>
          <div>
            <span>Trajanje:</span>
            <TimePicker
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
          <span>Vrsta druženja</span>
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
          <span>Ocjena</span>
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
          <span>Mjesto druženja</span>
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
        </div>
        <div className="formDiv">
          <span>Oblasti na koje su bile usmjerene aktivnosti</span>
          {activityCategories.map((category) => {
            return (
              <div key={category.id}>
                <label>{category.name}</label>
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
        <div className="formDiv">
          <span>Opis druženja</span>
          <textarea value={formDescription} onChange={onDescriptionChange} />
        </div>
        {shouldDisableForm() ? null : (
          <Button type="submit" onClick={addForm}>
            Submit
          </Button>
        )}
        <Button variant="secondary" onClick={navigateToForms}>
          Close
        </Button>
      </div>
    );
  }
  return null;
}

export default FormDetails;
