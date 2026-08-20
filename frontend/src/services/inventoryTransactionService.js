import api from "./api";

export const getInventoryTransactions = async () => {
  const response = await api.get("/inventory-transactions/");
  return response.data;
};

export const getInventoryTransactionById = async (id) => {
  const response = await api.get(
    `/inventory-transactions/${id}`
  );
  return response.data;
};

export const createInventoryTransaction = async (data) => {
  const response = await api.post(
    "/inventory-transactions/",
    data
  );
  return response.data;
};

export const updateInventoryTransaction = async (
  id,
  data
) => {
  const response = await api.put(
    `/inventory-transactions/${id}`,
    data
  );
  return response.data;
};

export const deleteInventoryTransaction = async (id) => {
  const response = await api.delete(
    `/inventory-transactions/${id}`
  );
  return response.data;
};