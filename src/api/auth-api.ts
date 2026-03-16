import axios from 'axios';
import axiosClient from './axios';
import { AuthTokens, extractAuthTokens } from './auth-token';
import {
    AuthResponse,
    GoogleLoginRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    UserResponse,
} from '../types/auth';
import { ApiResponse } from '../types/response';

export type LoginPayload = LoginRequest;
export type RegisterPayload = RegisterRequest;

const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const getLoginPath = () => import.meta.env.VITE_AUTH_LOGIN_PATH || '/users/auth/login';
const getRegisterPath = () => import.meta.env.VITE_AUTH_REGISTER_PATH || '/users/auth/register';
const getGoogleLoginPath = () => import.meta.env.VITE_AUTH_GOOGLE_LOGIN_PATH || '/users/auth/google';
const getRefreshPath = () => import.meta.env.VITE_AUTH_REFRESH_PATH || '/users/auth/refresh';
const getLogoutPath = () => import.meta.env.VITE_AUTH_LOGOUT_PATH || '/users/auth/logout';

export const register = async (payload: RegisterPayload): Promise<AuthTokens> => {
    const response = await axiosClient.post<ApiResponse<UserResponse>>(getRegisterPath(), payload);
    const data = response.data.data;

    if (!data) {
        throw new Error('Register response does not contain user data.');
    }

    return login({ username: payload.username, password: payload.password });
};

export const registerAndGetUser = async (payload: RegisterPayload): Promise<UserResponse> => {
    const response = await axiosClient.post<ApiResponse<UserResponse>>(getRegisterPath(), payload);
    const data = response.data.data;
    if (!data) {
        throw new Error('Register response does not contain user data.');
    }

    return data;
};

export const login = async (payload: LoginPayload): Promise<AuthTokens> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>(getLoginPath(), payload);
    const tokens = extractAuthTokens(response.data);

    if (!tokens) {
        throw new Error('Login response does not contain auth tokens.');
    }

    return tokens;
};

export const loginWithGoogle = async (payload: GoogleLoginRequest): Promise<AuthTokens> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>(getGoogleLoginPath(), payload);
    const tokens = extractAuthTokens(response.data);

    if (!tokens) {
        throw new Error('Google login response does not contain auth tokens.');
    }

    return tokens;
};

export const refresh = async (refreshToken: string | RefreshTokenRequest): Promise<AuthTokens> => {
    const tokenValue = typeof refreshToken === 'string' ? refreshToken : refreshToken.refreshToken;
    const response = await axios.post(
        `${getBaseUrl()}${getRefreshPath()}`,
        { refreshToken: tokenValue },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        },
    );

    const tokens = extractAuthTokens(response.data);
    if (!tokens) {
        throw new Error('Refresh response does not contain auth tokens.');
    }

    return tokens;
};

export const logout = async () => {
    await axiosClient.post<ApiResponse<null>>(getLogoutPath());
};
