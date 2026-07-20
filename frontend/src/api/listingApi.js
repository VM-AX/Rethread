import axiosClient from './axiosClient';

export const listingApi = {
  create: (formData) =>
    axiosClient.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  mine: () => axiosClient.get('/listings/mine'),
  getById: (id) => axiosClient.get(`/listings/${id}`),
  update: (id, data) => axiosClient.put(`/listings/${id}`, data),
  remove: (id) => axiosClient.delete(`/listings/${id}`),
  addImages: (id, formData) =>
    axiosClient.post(`/listings/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id, status) => axiosClient.patch(`/listings/${id}/status`, { status }),
};
