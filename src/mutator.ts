import Axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { postAuthRefresh } from "@/api/auth/auth";

type ApiResponse = { code: number; msg: string; data?: unknown };
type RetriableRequestConfig = InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean };

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ME_KEY = "blue_book:me";
const UNAUTHENTICATED_AUTH_ENDPOINTS = new Set(["/auth/login", "/auth/register", "/auth/refresh"]);

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

function isUnauthenticatedAuthEndpoint(url?: string) {
  return UNAUTHENTICATED_AUTH_ENDPOINTS.has(url ?? "");
}

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers && !isUnauthenticatedAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | undefined;

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ME_KEY);
  window.dispatchEvent(new Event("blue_book:session-expired"));
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new ApiError("登录已过期，请重新登录", 401);

  const auth = await postAuthRefresh({ refresh_token: refreshToken });
  if (!auth.access_token) throw new ApiError("登录凭证刷新失败", 401);

  localStorage.setItem(ACCESS_TOKEN_KEY, auth.access_token);
  if (auth.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, auth.refresh_token);
  return auth.access_token;
}

async function retryAfterRefresh(config: RetriableRequestConfig) {
  if (config._retriedAfterRefresh || isUnauthenticatedAuthEndpoint(config.url)) {
    throw new ApiError("登录已过期，请重新登录", 401);
  }

  try {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = undefined;
    });
    const token = await refreshPromise;
    config._retriedAfterRefresh = true;
    config.headers.Authorization = `Bearer ${token}`;
    return AXIOS_INSTANCE(config);
  } catch {
    clearSession();
    throw new ApiError("登录已过期，请重新登录", 401);
  }
}

AXIOS_INSTANCE.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    const { code, msg, data } = response.data;
    if (code < 200 || code >= 300) {
      const apiError = new ApiError(msg, code, data);
      if (code === 401) return retryAfterRefresh(response.config as RetriableRequestConfig);
      throw apiError;
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    if (error.response?.data) {
      const { code, msg, data } = error.response.data;
      if (code === 401 || error.response.status === 401) {
        return retryAfterRefresh(error.config as RetriableRequestConfig);
      }
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
