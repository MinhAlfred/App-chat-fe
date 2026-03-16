export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

const unwrapResponseData = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') {
        return payload;
    }

    const objectPayload = payload as Record<string, unknown>;
    if ('data' in objectPayload) {
        return objectPayload.data;
    }

    return payload;
};

export const extractAuthTokens = (payload: unknown): AuthTokens | null => {
    const value = unwrapResponseData(payload);
    if (!value || typeof value !== 'object') {
        return null;
    }

    const source = value as Record<string, unknown>;
    const accessToken =
        (source.accessToken as string | undefined) ||
        (source.token as string | undefined) ||
        (source.jwt as string | undefined) ||
        (source.access_token as string | undefined);

    const refreshToken =
        (source.refreshToken as string | undefined) ||
        (source.refresh_token as string | undefined) ||
        (source.refresh as string | undefined);

    if (!accessToken || !refreshToken) {
        return null;
    }

    return { accessToken, refreshToken };
};
