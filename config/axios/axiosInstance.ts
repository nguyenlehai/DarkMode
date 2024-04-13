import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {ERROR_CODE} from "../../utils/constants";
import {removeLocalStorage, setLocalStorage} from "../../utils/helpers";

interface MyAxiosInstance extends AxiosInstance {
  setToken: (token: string) => void;
}

const Instance = axios.create({
  baseURL: process.env.API_LINK,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
}) as MyAxiosInstance;

function refreshToken() {
  return Instance.get("/user/refreshToken").then((res) => res.data);
}

const IS_SERVER = typeof window === "undefined";

Instance.interceptors.request.use(
  (config) => {
    if (!IS_SERVER) {
      const token = "";
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (err: AxiosError) => {
    return Promise.reject(err);
  },
);

Instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const { config, response } = error;

    if (response?.status === ERROR_CODE.UN_AUTHORIZE) {
      return refreshToken()
        .then((res) => {
          const { accessToken = null } = res;
          setLocalStorage("accessToken", accessToken);
          if (config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
          return Instance(config);
        })
        .catch(() => {
          removeLocalStorage();
          window.location.href = "/login";
        });
    } else {
      // TODO, handler for special case, like Error 400, 500,..
    }
    return Promise.reject(error);
  },
);

export default Instance;
