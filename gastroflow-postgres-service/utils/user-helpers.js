export const buildUserResponse = (user) => {
  const roleName = user.UserRoles?.[0]?.Role?.Name || user.Role;

  return {
    Id: user.Id,
    id: user.Id,
    Name: user.Name,
    name: user.Name,
    Surname: user.Surname,
    surname: user.Surname,
    Username: user.Username,
    username: user.Username,
    Email: user.Email,
    email: user.Email,
    phone: user.UserProfile && user.UserProfile.Phone ? user.UserProfile.Phone : user.Phone,
    profileImage: user.UserProfile && user.UserProfile.ProfilePicture 
      ? user.UserProfile.ProfilePicture 
      : (user.ProfileImage || null),
    Role: roleName,
    role: roleName,
    Status: user.Status,
    status: user.Status,
    RestaurantId: user.RestaurantId || null,
    restaurantId: user.RestaurantId || null,
    idRestaurante: user.RestaurantId || null,
    isEmailVerified: user.UserEmail ? user.UserEmail.EmailVerified : false,
    CreatedAt: user.CreatedAt,
    createdAt: user.CreatedAt,
    UpdatedAt: user.UpdatedAt,
    updatedAt: user.UpdatedAt,
  };
};
