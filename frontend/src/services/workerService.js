import api from "./api";

export const getWorkers = async () => {
  const response = await api.get("/workers/");
  return response.data;
};

export const getWorker = async (workerId) => {
  const response = await api.get(`/workers/${workerId}`);
  return response.data;
};

export const createWorker = async (data) => {
  const response = await api.post("/workers/", data);
  return response.data;
};

export const updateWorker = async (workerId, data) => {
  const response = await api.put(`/workers/${workerId}`, data);
  return response.data;
};

export const deleteWorker = async (workerId) => {
  const response = await api.delete(`/workers/${workerId}`);
  return response.data;
};