import "./App.css";
import React from "react";
import MainPage from "./dashboard/MainPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Coordinators from "./coordinator/Coordinators";
import Volunteer from "./volunteer/Volunteer";
import VolunteerHours from "./volunteer/VolunteerHours";
import Child from "./child/Child";

import ChildDetails from "./child/ChildDetails";
import VolunteerDetails from "./volunteer/VolunteerDetails";
import Form from "./form/Form";
import FormDetails from "./form/FormDetails";
import Sidebar from "./dashboard/components/Sidebar";

import "./dashboard/Dashboard.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      {/* This is the alias of BrowserRouter i.e. Router */}
      <Router>
        <ToastContainer />
        <Sidebar>
          <Routes>
            <Route exact path="/" element={<MainPage />} />
            <Route exact path="/coordinators" element={<Coordinators />} />
            <Route exact path="/volunteers" element={<Volunteer />} />
            <Route
              exact
              path="/volunteers/details"
              element={<VolunteerDetails />}
            />
            <Route exact path="/hours" element={<VolunteerHours />} />
            <Route exact path="/childs" element={<Child />} />
            <Route exact path="/childs/details" element={<ChildDetails />} />
            <Route exact path="/forms" element={<Form />} />
            <Route exact path="/forms/details" element={<FormDetails />} />
          </Routes>
        </Sidebar>
      </Router>
    </>
  );
}

export default App;
