import axiosClient from './axiosClient';

export const aiApi = {
  grade: (listingId) => axiosClient.post(`/ai/listings/${listingId}/grade`),
  listingReports: (listingId) => axiosClient.get(`/ai/listings/${listingId}/reports`),
  reportById: (reportId) => axiosClient.get(`/ai/reports/${reportId}`),
  allReports: (params) => axiosClient.get('/ai/reports', { params }),
  override: (reportId, data) => axiosClient.put(`/ai/reports/${reportId}/override`, data),
};
