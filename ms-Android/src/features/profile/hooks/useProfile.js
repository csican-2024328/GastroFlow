import { useCallback, useState } from 'react';
import {
  getProfile as getProfileRequest,
  updateProfile as updateProfileRequest,
  updateProfileAvatar as updateProfileAvatarRequest,
} from '../../../shared/api/profileApi';
import { useAuthStore } from '../../../shared/store/authStore';

export const useProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getProfileRequest();
      setUser(data.data);
      return data.data;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const updateProfile = useCallback(
    async ({ name, phone }) => {
      try {
        setSavingProfile(true);
        const { data } = await updateProfileRequest({ name, phone });
        setUser(data.data);
        return data.data;
      } finally {
        setSavingProfile(false);
      }
    },
    [setUser],
  );

  const updateAvatar = useCallback(
    async (asset) => {
      try {
        setUploadingAvatar(true);
        const { data } = await updateProfileAvatarRequest(asset);
        setUser(data.data);
        return data.data;
      } finally {
        setUploadingAvatar(false);
      }
    },
    [setUser],
  );

  return { loading, savingProfile, uploadingAvatar, getProfile, updateProfile, updateAvatar };
};
