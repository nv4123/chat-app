// // src/api/axiosInstance.js

// import axios from "axios";

// // Debug: log the baseURL being used
// console.log("AXIOS BASE URL:", process.env.REACT_APP_BACKEND_API);
// // Create an Axios instance
// const axiosInstance = axios.create({
//   baseURL: process.env.REACT_APP_BACKEND_API,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Automatically attach token to every request if available
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default axiosInstance;
// src/api/axiosInstance.js

import axios from "axios";

// Log the base URL (optional for debug)
console.log("AXIOS BASE URL:", process.env.REACT_APP_BACKEND_API);

// Create the Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_API,  // ✅ Make sure this env var is defined
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to headers if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");  // ✅ Assumes you store token at login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;