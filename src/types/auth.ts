export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export enum OnlineStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    AWAY = 'AWAY',
}

export enum AuthProvider {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
}

export type LoginRequest = {
    username: string;
    password: string;
};

export type RegisterRequest = {
    username: string;
    email: string;
    password: string;
    displayName: string;
};

export type GoogleLoginRequest = {
    idToken: string;
};

export type RefreshTokenRequest = {
    refreshToken: string;
};

export type UpdateMyProfileRequest = {
    displayName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
};

export type ChangePasswordRequest = {
    oldPassword: string;
    newPassword: string;
};

export type UpdateUserRoleRequest = {
    role: Role;
};

export type UserResponse = {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatar: string;
    phoneNumber: string;
    dateOfBirth: string;
    provider: AuthProvider;
    role: Role;
    onlineStatus: OnlineStatus;
    lastSeen: string;
    isActive: boolean;
    createdAt: string;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
};

export type OnlineStatusResponse = {
    userId: string;
    isOnline: boolean;
    lastSeen: string;
};