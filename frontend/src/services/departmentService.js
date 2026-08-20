import api from "./api";

export const getDepartments = async () => {
  const response = await api.get("/departments/");
  return response.data;
};

export const getDepartment = async (departmentId) => {
  const response = await api.get(`/departments/${departmentId}`);
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post("/departments/", data);
  return response.data;
};

export const updateDepartment = async (departmentId, data) => {
  const response = await api.put(
    `/departments/${departmentId}`,
    data
  );
  return response.data;
};

export const deleteDepartment = async (departmentId) => {
  const response = await api.delete(
    `/departments/${departmentId}`
  );
  return response.data;
};