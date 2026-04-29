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

  return axiosClient.put('/auth/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
