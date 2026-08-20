import api from "./api";

export const getSafetyIncidents = async () => {
  const response = await api.get("/safety-incidents/");
  return response.data;
};

export const getSafetyIncidentById = async (id) => {
  const response = await api.get(`/safety-incidents/${id}`);
  return response.data;
};

export const createSafetyIncident = async (data) => {
  const response = await api.post("/safety-incidents/", data);
  return response.data;
};

export const updateSafetyIncident = async (id, data) => {
  const response = await api.put(`/safety-incidents/${id}`, data);
  return response.data;
};

export const deleteSafetyIncident = async (id) => {
  const response = await api.delete(`/safety-incidents/${id}`);
  return response.data;
};