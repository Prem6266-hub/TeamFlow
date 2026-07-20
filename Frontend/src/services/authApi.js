import api from "./api";

export const registerUser = async (userData) => {
    const response = await api.post(
        "/api/auth/register",
        userData
    );
    return response.data;
}

export const loginUser = async (userData) => {
  const response = await api.post(
    "/api/auth/login",
    userData
  );

  return response.data;
};

export const updateProfileUser = async (profileData) => {
  const token = localStorage.getItem("teamflowToken");
  const response = await api.put(
    "/api/auth/profile",
    profileData,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  );

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post(
    "/api/auth/logout"
  );

  return response.data;
};