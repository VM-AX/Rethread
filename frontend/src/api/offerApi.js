import axiosClient from './axiosClient';

export const offerApi = {
  create: (listingId, offerPrice, message) =>
    axiosClient.post('/offers', { listingId, offerPrice, message }),
  list: (params) => axiosClient.get('/offers', { params }),
  getById: (id) => axiosClient.get(`/offers/${id}`),
  accept: (id, message) => axiosClient.patch(`/offers/${id}/accept`, { message }),
  reject: (id, message) => axiosClient.patch(`/offers/${id}/reject`, { message }),
  remove: (id) => axiosClient.delete(`/offers/${id}`),
};
