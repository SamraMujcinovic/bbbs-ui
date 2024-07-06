// fetchWrapper.js
import { useLoader } from "./loader/LoaderContext";

export const useFetch = () => {
  const { showLoader, hideLoader } = useLoader();

  const fetchWrapper = async (
    url,
    { headers = {}, params = {}, ...options }
  ) => {
    showLoader();
    // Filter out undefined params
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    const queryParams = new URLSearchParams(filteredParams).toString();
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    } finally {
      hideLoader();
    }
  };

  return fetchWrapper;
};
