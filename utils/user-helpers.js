export const buildUserResponse = (user) => {
  return {
    id: user.Id,
    name: user.Name,
    surname: user.Surname,
    username: user.Username,
    email: user.Email,
    phone: user.UserProfile && user.UserProfile.Phone ? user.UserProfile.Phone : user.Phone,
    profileImage: user.UserProfile && user.UserProfile.ProfilePicture 
      ? user.UserProfile.ProfilePicture 
      : (user.ProfileImage || null),
    role: user.Role,
    status: user.Status,
    isEmailVerified: user.UserEmail ? user.UserEmail.EmailVerified : false,
    createdAt: user.CreatedAt,
    updatedAt: user.UpdatedAt,
  };
};
