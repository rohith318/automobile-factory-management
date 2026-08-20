import api from "./api";

export const getPayroll = async () => {
  const response = await api.get("/payroll/");
  return response.data;
};

export const getPayrollById = async (id) => {
  const response = await api.get(`/payroll/${id}`);
  return response.data;
};

export const createPayroll = async (data) => {
  const response = await api.post("/payroll/", data);
  return response.data;
};

export const updatePayroll = async (id, data) => {
  const response = await api.put(`/payroll/${id}`, data);
  return response.data;
};

export const deletePayroll = async (id) => {
  const response = await api.delete(`/payroll/${id}`);
  return response.data;
};

export const generatePayroll = async (workerId) => {
  const response = await api.post(
    `/payroll/generate?worker_id=${workerId}`
  );
  return response.data;
};