import api from "./api";

export const getRawMaterials = async () => {
  const response = await api.get("/raw-materials/");
  return response.data;
};

export const getRawMaterialById = async (id) => {
  const response = await api.get(`/raw-materials/${id}`);
  return response.data;
};

export const createRawMaterial = async (data) => {
  const response = await api.post("/raw-materials/", data);
  return response.data;
};

export const updateRawMaterial = async (id, data) => {
  const response = await api.put(`/raw-materials/${id}`, data);
  return response.data;
};

export const deleteRawMaterial = async (id) => {
  const response = await api.delete(`/raw-materials/${id}`);
  return response.data;
};