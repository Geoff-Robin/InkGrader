import axios from "axios";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/auth-context"; // Adjust path as necessary

//const API_URL = "http://127.0.0.1:8000/api/";
const isDevelopment=import.meta.env.VITE_MODE==='development'
const API_URL=isDevelopment? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_DEPLOY
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosPrivateInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh token function
async function refreshAccessToken(setAccessToken,setRefreshToken) {
  try {
    const refreshToken = sessionStorage.getItem("refreshToken"); // Get the refresh token from localStorage
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${API_URL}/refresh`,
      { refresh_token: refreshToken } // Send the refresh token in the body
    );
    const newAccessToken = response?.data?.ACCESS_TOKEN;
    const newRefreshToken = response?.data?.REFRESH_TOKEN;
    if (newAccessToken) {
      sessionStorage.setItem("accessToken", newAccessToken);
      sessionStorage.setItem("refreshToken", newRefreshToken);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      return newAccessToken;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
  return null;
}

// Custom Axios Hook
export function useAxiosPrivate() {
  const { setAccessToken,setRefreshToken } = useContext(AuthContext);

  useEffect(() => {
    const requestInterceptor = axiosPrivateInstance.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosPrivateInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (
          (error?.response?.status === 401 || error?.response?.status === 403) &&
          !prevRequest?.sent
        ) {
          
          const newAccessToken = await refreshAccessToken(setAccessToken,setRefreshToken);
          console.log(newAccessToken)
          if (newAccessToken) {
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosPrivateInstance(prevRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivateInstance.interceptors.request.eject(requestInterceptor);
      axiosPrivateInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [setAccessToken, setRefreshToken]);

  return axiosPrivateInstance;
} 