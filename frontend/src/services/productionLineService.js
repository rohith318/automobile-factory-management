import api from "./api";

export const getProductionLines = async () => {
  const response = await api.get("/production-lines/");
  return response.data;
};

export const getProductionLine = async (productionLineId) => {
  const response = await api.get(
    `/production-lines/${productionLineId}`
  );
  return response.data;
};

export const createProductionLine = async (data) => {
  const response = await api.post(
    "/production-lines/",
    data
  );
  return response.data;
};

export const updateProductionLine = async (
  productionLineId,
  data
) => {
  const response = await api.put(
    `/production-lines/${productionLineId}`,
    data
  );
  return response.data;
};

export const deleteProductionLine = async (
  productionLineId
) => {
  const response = await api.delete(
    `/production-lines/${productionLineId}`
  );
  return response.data;
};