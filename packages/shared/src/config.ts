const isDev = import.meta.env.MODE === 'development';

// Core Application (Vite)
export const CORE_URL = isDev ? 'http://localhost:5173' : 'https://core.web.app';

// Marketing Site (Astro/Next.js)
export const WWW_URL = isDev ? 'http://localhost:5174' : 'https://www.web.app';

// Bridge Link (Viral Tool)
export const LINK_URL = isDev ? 'http://localhost:5175' : 'https://link.web.app';
