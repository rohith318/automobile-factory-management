import api from "./api";

export const getMachinery = async () => {
  const response = await api.get("/machinery/");
  return response.data;
};

export const getMachineryById = async (machineryId) => {
  const response = await api.get(
    `/machinery/${machineryId}`
  );

  return response.data;
};

export const createMachinery = async (data) => {
  const response = await api.post(
    "/machinery/",
    data
  );

  return response.data;
};

export const updateMachinery = async (
  machineryId,
  data
) => {
  const response = await api.put(
    `/machinery/${machineryId}`,
    data
  );

  return response.data;
};

export const deleteMachinery = async (
  machineryId
) => {
  const response = await api.delete(
    `/machinery/${machineryId}`
  );

  return response.data;
};

// ==================================================
// MACHINE MONITORING
// ==================================================

export const getMachineMonitoring = async () => {
  const response = await api.get(
    "/machinery/monitoring"
  );

  return response.data;
};


// ==================================================
// UPDATE MACHINE MONITORING
// ==================================================

export const updateMachineMonitoring = async (
  machineryId,
  data
) => {
  const response = await api.put(
    `/machinery/${machineryId}/monitor`,
    data
  );

  return response.data;
};

// ==================================================
// PREDICTIVE MAINTENANCE
// ==================================================

export const getPredictiveMaintenance = async () => {
  const response = await api.get(
    "/machinery/predictive-maintenance"
  );

  return response.data;
};