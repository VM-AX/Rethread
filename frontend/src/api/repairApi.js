import axiosClient from './axiosClient';

export const repairApi = {
  create: (formData) =>
    axiosClient.post('/repairs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  mine: () => axiosClient.get('/repairs/mine'),
  partnerRequests: (params) => axiosClient.get('/repairs/partner/requests', { params }),
  accept: (id) => axiosClient.patch(`/repairs/${id}/accept`),
  reject: (id, reason) => axiosClient.patch(`/repairs/${id}/reject`, { reason }),
  updateProgress: (id, status, note) => axiosClient.patch(`/repairs/${id}/progress`, { status, note }),
};
