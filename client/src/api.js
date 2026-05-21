import axios from "axios";

const api = axios.create({
  baseURL: "https://pet-insurance-virid.vercel.app/api",
});

export default api;