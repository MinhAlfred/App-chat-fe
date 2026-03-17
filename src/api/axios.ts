import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { extractAuthTokens } from './auth-token';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../auth/session';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

type ErrorResponsePayload = {
    message?: string;
};

const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const getRefreshPath = () => import.meta.env.VITE_AUTH_REFRESH_PATH || '/users/auth/refresh';
const getLoginPath = () => import.meta.env.VITE_AUTH_LOGIN_PATH || '/users/auth/login';
const getRegisterPath = () => import.meta.env.VITE_AUTH_REGISTER_PATH || '/users/auth/register';
const getGoogleLoginPath = () => import.meta.env.VITE_AUTH_GOOGLE_LOGIN_PATH || '/users/auth/google';

const axiosClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processRefreshQueue = (token: string | null) => {
    refreshQueue.forEach((subscriber) => subscriber(token));
    refreshQueue = [];
};

const queueRefreshSubscriber = (callback: (token: string | null) => void) => {
    refreshQueue.push(callback);
};

const normalizeApiError = (error: AxiosError) => {
    const responseData = error.response?.data as ErrorResponsePayload | undefined;
    const backendMessage = responseData?.message;

    if (backendMessage) {
        return new Error(backendMessage);
    }

    return error;
};

const isAuthEndpoint = (url: string) => {
    const authPaths = [getLoginPath(), getRegisterPath(), getGoogleLoginPath(), getRefreshPath()];
    return authPaths.some((path) => url.includes(path));
};

const performRefresh = async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
        return null;
    }

    const response = await axios.post(
        `${getBaseUrl()}${getRefreshPath()}`,
        { refreshToken: currentRefreshToken },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        },
    );

    const tokens = extractAuthTokens(response.data);
    if (!tokens) {
        return null;
    }

    saveTokens(tokens);
    return tokens.accessToken;
};

axiosClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        if (!originalRequest) {
            return Promise.reject(normalizeApiError(error));
        }

        const status = error.response?.status;
        const requestUrl = originalRequest.url || '';
        const isAuthRequest = isAuthEndpoint(requestUrl);
        const hasAccessToken = Boolean(getAccessToken());

        if (status !== 401 || originalRequest._retry || isAuthRequest || !hasAccessToken) {
            return Promise.reject(normalizeApiError(error));
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queueRefreshSubscriber((newToken) => {
                    if (!newToken) {
                        reject(normalizeApiError(error));
                        return;
                    }

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(axiosClient(originalRequest));
                });
            });
        }

        isRefreshing = true;

        try {
            const newAccessToken = await performRefresh();
            processRefreshQueue(newAccessToken);

            if (!newAccessToken) {
                clearTokens();
                return Promise.reject(normalizeApiError(error));
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);
        } catch (refreshError) {
            processRefreshQueue(null);
            clearTokens();
            if (axios.isAxiosError(refreshError)) {
                return Promise.reject(normalizeApiError(refreshError));
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default axiosClient;