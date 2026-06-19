import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let tokenGetter = null;

export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

api.interceptors.request.use(
  async (config) => {
    if (tokenGetter) {
      const token = await tokenGetter();
      console.log("TOKEN SENT TO BACKEND:");
      console.log(token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;