import { axiosClient } from './api.js';

// Use a specific auth base for auth-related endpoints. The workspace defines
// VITE_AUTH_URL (eg. http://localhost:3007/api/v1) and a general VITE_API_URL
// that may point to other services (eg. mongo service). Profile endpoints
// live on the auth/postgres service, so target VITE_AUTH_URL when present.
const AUTH_BASE = import.meta.env.VITE_AUTH_URL || 'http://localhost:3007/api/v1';

export const getProfile = async () => {
  return axiosClient.get(`${AUTH_BASE}/auth/profile`);
};

export const updateProfile = async (formData) => {
  return axiosClient.put(`${AUTH_BASE}/auth/profile`, {
    name: formData.name,
    surname: formData.surname,
    phone: formData.phone,
  })
};

export const updateProfileAvatar = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  // Let the browser / axios set the Content-Type (including boundary).
  // Setting it manually can omit the multipart boundary and break multer parsing on the server.
  try {
    return await axiosClient.put(`${AUTH_BASE}/auth/profile/avatar`, formData);
  } catch (err) {
    // If the server returns 404 for PUT (some setups expect POST for multipart), retry with POST
    const statusCode = err?.response?.status;
    if (statusCode === 404) {
      try {
        return await axiosClient.post(`${AUTH_BASE}/auth/profile/avatar`, formData);
      } catch (err2) {
        // fall through to throwing enriched error
        err = err2;
      }
    }
    // Enrich error so caller can display helpful info
    const status = err?.response?.status;
    const url = err?.config?.url || `${AUTH_BASE}/auth/profile/avatar`;
    const message = err?.response?.data?.message || err.message || 'Error uploading avatar';
    const e = new Error(`Request failed ${status || ''} ${url}: ${message}`);
    e.cause = { status, url, original: err };
    throw e;
  }
};
