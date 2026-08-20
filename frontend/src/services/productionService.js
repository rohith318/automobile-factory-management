import api from "./api";

export const getProductions = async () => {
  const response = await api.get("/production/");
  return response.data;
};

export const getProduction = async (productionId) => {
  const response = await api.get(
    `/production/${productionId}`
  );
  return response.data;
};

export const createProduction = async (data) => {
  const response = await api.post(
    "/production/",
    data
  );
  return response.data;
};

export const updateProduction = async (
  productionId,
  data
) => {
  const response = await api.put(
    `/production/${productionId}`,
    data
  );
  return response.data;
};

export const deleteProduction = async (
  productionId
) => {
  const response = await api.delete(
    `/production/${productionId}`
  );
  return response.data;
};

export const getLiveProductionStatus = async () => {
  const response = await api.get(
    "/production/live-status"
  );
  return response.data;
};

export const getProductionAnalytics = async () => {
  const response = await api.get(
    "/analytics/production"
  );
  return response.data;
};