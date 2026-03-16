export type ApiResponse<T> = {
    status: number;
    message: string;
    data?: T | null;
    errorCode?: string;
    timestamp: string;
};

export type CursorPage<T> = {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
};

export type PageResponse<T> = {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};