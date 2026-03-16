export type Screen = 'login' | 'chat' | 'settings' | 'contacts' | 'createGroup';

export const screenPath: Record<Screen, string> = {
    login: '/login',
    chat: '/chat',
    settings: '/settings',
    contacts: '/contacts',
    createGroup: '/groups/create',
};

export const pathToScreen = (pathname: string): Screen | null => {
    const entry = (Object.entries(screenPath) as Array<[Screen, string]>).find(([, path]) => path === pathname);
    return entry ? entry[0] : null;
};
