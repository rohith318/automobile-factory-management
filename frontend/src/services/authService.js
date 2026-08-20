import api from "./api";

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email: email,
    password: password,
  });

  return response.data;
};

export const registerUser = async (
  fullName,
  email,
  password
) => {
  const response = await api.post("/auth/register", {
    full_name: fullName,
    email: email,
    password: password,
  });

  return response.data;
};