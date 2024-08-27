import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";

axios.interceptors.response.use(
  (response) => {
    return response;
  },

  async function (error) {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      originalRequest.url === `${process.env.REACT_APP_REFRESH_URL}`
    ) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const res = await axios
        .post("https://sbss.hopto.org/login/refresh", {
          withCredentials: true, // Ensures that cookies are sent with the request
          headers: {
            Accept: "application/json",
          },
        })
        .catch((error) => {
          if (error.response.status === 401) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("roles");
            sessionStorage.removeItem("user");
            //window.location.href = "/";
          }
        });

      if (res.status === 200) {
        // first remove old token, then set new
        sessionStorage.removeItem("token");
        sessionStorage.setItem("token", res.data.access);

        return axios({
          method: originalRequest.method,
          url: originalRequest.url,
          data:
            originalRequest.data !== undefined
              ? JSON.parse(originalRequest.data)
              : undefined,
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
          params: originalRequest.params,
        });
      }
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
