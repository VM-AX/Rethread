import axiosClient from './axiosClient';

export const adminApi = {
  users: (params) => axiosClient.get('/admin/users', { params }),
  toggleBlock: (id, block, reason) => axiosClient.patch(`/admin/users/${id}/block`, { block, reason }),
  toggleDelete: (id, restore) => axiosClient.delete(`/admin/users/${id}`, { data: { restore } }),
  listings: (params) => axiosClient.get('/admin/listings', { params }),
  moderateListing: (id, action, reason) =>
    axiosClient.patch(`/admin/listings/${id}/moderate`, { action, reason }),
  dashboard: () => axiosClient.get('/admin/dashboard'),
};
