import api from "./api";

export const getFactories = async () => {
  const response = await api.get("/factories/");
  return response.data;
};

export const getFactory = async (factoryId) => {
  const response = await api.get(`/factories/${factoryId}`);
  return response.data;
};

export const createFactory = async (data) => {
  const response = await api.post("/factories/", data);
  return response.data;
};

export const updateFactory = async (factoryId, data) => {
  const response = await api.put(`/factories/${factoryId}`, data);
  return response.data;
};

export const deleteFactory = async (factoryId) => {
  const response = await api.delete(`/factories/${factoryId}`);
  return response.data;
};