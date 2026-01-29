import { IMAGE_BASE_URL } from "./api";

/**
 * Normalizes an image path to a full URL.
 * @param {string} path - The image path or URL.
 * @returns {string|null} - The full URL or null if path is empty.
 */
export const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE_URL}${cleanPath}`;
};
