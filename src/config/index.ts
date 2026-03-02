const formatAppName = (key: string) =>
  (key || "")
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const config = {
  NAME_KEY: import.meta.env.VITE_API_APP_NAME,
  APP_NAME: formatAppName(import.meta.env.VITE_API_APP_NAME || ""),
  USER_IMAGE_URL: import.meta.env.VITE_API_IMAGE_BASE_URL,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  BACKEND_IMAGE_URL: import.meta.env.VITE_API_AWS_BASE_URL,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  GOOGLE_MAP_KEY: import.meta.env.VITE_GOOGLE_MAP_KEY,
  AI_API_BASE_URL: import.meta.env.VITE_AI_API_BASE_URL,
  // Use Vite's mode as a stand‑in for NODE_ENV
  NODE_ENV: import.meta.env.MODE,
};

export default config;
