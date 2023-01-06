import axios from "axios";

export async function logout() {
  try {
    await axios
      .post(
        `${process.env.REACT_APP_API_URL}/logout`,
        {
          all: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("roles");
        sessionStorage.removeItem("user");
        window.location.href = "/";
      });
  } catch (error) {
    console.log(error);
  }
}
