import { AxiosResponse } from 'axios';
import { ApiResponse } from '../types/response';

export const unwrapApiData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    const data = response.data.data;
    if (data === undefined || data === null) {
        throw new Error(response.data.message || 'API response data is empty.');
    }

    return data;
};

export const toQueryParams = (params: Record<string, string | number | undefined | null>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        searchParams.set(key, String(value));
    });

    return searchParams;
};
