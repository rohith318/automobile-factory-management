import api from "./api";

// Get QR information for a machinery item
export const getMachineryQRData = async (machineryId) => {
  const response = await api.get(
    `/qr/machinery/${machineryId}`
  );

  return response.data;
};

// Lookup an asset from QR data
export const lookupQRAsset = async (
  assetType,
  assetId
) => {
  const response = await api.get("/qr/lookup", {
    params: {
      asset_type: assetType,
      asset_id: assetId,
    },
  });

  return response.data;
};