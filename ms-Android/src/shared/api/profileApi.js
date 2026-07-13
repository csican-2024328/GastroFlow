import authClient from './authClient';

export const getProfile = () => authClient.get('/auth/profile');

export const updateProfile = (data) =>
  authClient.put('/auth/profile', {
    name: data.name,
    phone: data.phone,
  });

export const updateProfileAvatar = (asset) => {
  const extension = asset.uri.split('.').pop()?.split('?')[0] || 'jpg';
  const formData = new FormData();
  formData.append('profilePicture', {
    uri: asset.uri,
    name: asset.fileName || `avatar.${extension}`,
    type: asset.mimeType || `image/${extension}`,
  });

  // No fijar Content-Type manualmente: axios/RN agrega el boundary del multipart automáticamente.
  return authClient.put('/auth/profile/avatar', formData, { timeout: 30000 });
};
