import type { Metadata } from 'next';

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const DEFAULT_SITE_TITLE = 'Virgin Travel Studio';

export const DEFAULT_SITE_DESCRIPTION =
    'Туры, путешествия и индивидуальные маршруты от Virgin Travel Studio.';

const normalizePath = (path: string) => {
    if (!path || path === '/') {
        return '/';
    }

    return path.startsWith('/') ? path : `/${path}`;
};

export const buildMetadata = (
    title: string,
    description: string,
    path: string,
): Metadata => {
    const normalizedPath = normalizePath(path);

    const canonical =
        normalizedPath === '/'
            ? SITE_URL
            : `${SITE_URL}${normalizedPath}`;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
    };
};