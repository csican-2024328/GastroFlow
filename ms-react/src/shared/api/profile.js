import { axiosClient } from './api.js';

export const getProfile = async () => {
  return axiosClient.get('/auth/profile');
};

export const updateProfile = async (formData) => {
  return axiosClient.put('/auth/profile', {
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
  return axiosClient.put('/auth/profile/avatar', formData);
};
