import api from "./api";

export const getAttendance = async () => {
  const response = await api.get("/attendance/");
  return response.data;
};

export const getAttendanceRecord = async (attendanceId) => {
  const response = await api.get(`/attendance/${attendanceId}`);
  return response.data;
};

export const createAttendance = async (data) => {
  const response = await api.post("/attendance/", data);
  return response.data;
};

export const updateAttendance = async (attendanceId, data) => {
  const response = await api.put(
    `/attendance/${attendanceId}`,
    data
  );
  return response.data;
};

export const deleteAttendance = async (attendanceId) => {
  const response = await api.delete(
    `/attendance/${attendanceId}`
  );
  return response.data;
};