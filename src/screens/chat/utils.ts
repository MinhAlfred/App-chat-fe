export const formatTime = (value?: string): string => {
    if (!value) return '--:--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--:--';
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
};

export const formatDateLabel = (value?: string): string => {
    if (!value) return 'No messages';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No messages';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};
