import Axios, { type AxiosRequestConfig, type AxiosResponse, AxiosError } from "axios";

export class ApiError extends Error {
  code: number;
  msg: string;
  data?: unknown;

  constructor(msg: string, code: number, data?: unknown) {
    super(msg);
    this.name = "ApiError";
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
}

type ApiPayload<T> = T extends { data?: infer TData } ? TData : void;

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "/api/v1",
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

AXIOS_INSTANCE.interceptors.response.use(
  (response: AxiosResponse<{ code: number; msg: string; data?: unknown }>) => {
    const { code, msg, data } = response.data;
    if (code < 200 || code >= 300) {
      throw new ApiError(msg, code, data);
    }
    return response;
  },
  (error: AxiosError<{ code: number; msg: string; data?: unknown }>) => {
    if (error.response?.data) {
      const { code, msg, data } = error.response.data;
      throw new ApiError(msg, code, data);
    }
    throw error;
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig | string,
  options?: AxiosRequestConfig,
): Promise<ApiPayload<T>> => {
  const requestConfig: AxiosRequestConfig =
    typeof config === "string" ? { url: config, ...options } : { ...config, ...options };
  const promise = AXIOS_INSTANCE(requestConfig).then(({ data }) => data.data as ApiPayload<T>);

  return promise;
};

export default customInstance;
