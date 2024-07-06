// GlobalLoader.js
import React from "react";
import { useLoader } from "./LoaderContext";
import Loader from "./Loader";

const GlobalLoader = () => {
  const { loading } = useLoader();

  return loading ? <Loader /> : null;
};

export default GlobalLoader;
