import axios from "axios";

// Backend: qubnix Dashboard API (swigerjsonDash.json), manzil — `VITE_API_URL` (.env).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
