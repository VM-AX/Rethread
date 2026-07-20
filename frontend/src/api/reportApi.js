import axiosClient from './axiosClient';

export const reportApi = {
  create: (listingId, reason, description) =>
    axiosClient.post('/reports', { listingId, reason, description }),
  adminList: (params) => axiosClient.get('/admin/reports', { params }),
  adminUpdate: (id, payload) => axiosClient.patch(`/admin/reports/${id}`, payload),
};
