import axiosClient from './axiosClient';

export const orderApi = {
  create: (data) => axiosClient.post('/orders', data),
  mine: () => axiosClient.get('/orders/mine'),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  sellerOrders: () => axiosClient.get('/orders/seller/mine'),
  updateStatus: (id, status) => axiosClient.patch(`/orders/${id}/status`, { status }),
  pay: (id) => axiosClient.post(`/orders/${id}/pay`),
  cancel: (id, reason) => axiosClient.post(`/orders/${id}/cancel`, { reason }),
};
