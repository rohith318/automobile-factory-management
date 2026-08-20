import api from "./api";

export const getRobotics = async () => {
  const response = await api.get("/robotics/");
  return response.data;
};

export const getRoboticsById = async (roboticsId) => {
  const response = await api.get(
    `/robotics/${roboticsId}`
  );
  return response.data;
};

export const createRobotics = async (data) => {
  const response = await api.post(
    "/robotics/",
    data
  );
  return response.data;
};

export const updateRobotics = async (
  roboticsId,
  data
) => {
  const response = await api.put(
    `/robotics/${roboticsId}`,
    data
  );
  return response.data;
};

export const deleteRobotics = async (
  roboticsId
) => {
  const response = await api.delete(
    `/robotics/${roboticsId}`
  );
  return response.data;
};