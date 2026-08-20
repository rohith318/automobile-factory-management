import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const getHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getProductionAnalytics = async () => {
  const response = await axios.get(
    `${API_URL}/analytics/production`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

export const getProductionLiveStatus = async () => {
  const response = await axios.get(
    `${API_URL}/production/live-status`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

export const getCostAnalytics = async () => {
  const response = await axios.get(
    `${API_URL}/analytics/cost`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

export const getMaintenanceCostReport = async () => {
  const response = await axios.get(
    `${API_URL}/maintenance/cost-report`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

export const getQualityReport = async () => {
  const response = await axios.get(
    `${API_URL}/quality-checks/quality-report`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};