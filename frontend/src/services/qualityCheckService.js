import api from "./api";

export const getQualityChecks = async () => {
  const response = await api.get("/quality-checks/");
  return response.data;
};

export const getQualityCheckById = async (id) => {
  const response = await api.get(`/quality-checks/${id}`);
  return response.data;
};

export const createQualityCheck = async (data) => {
  const response = await api.post("/quality-checks/", data);
  return response.data;
};

export const updateQualityCheck = async (id, data) => {
  const response = await api.put(
    `/quality-checks/${id}`,
    data
  );
  return response.data;
};

export const deleteQualityCheck = async (id) => {
  const response = await api.delete(
    `/quality-checks/${id}`
  );
  return response.data;
};

export const getQualityReport = async () => {
  const response = await api.get(
    "/quality-checks/quality-report"
  );
  return response.data;
};