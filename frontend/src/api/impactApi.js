import axiosClient from './axiosClient';

export const impactApi = {
  categories: () => axiosClient.get('/impact/categories'),
  order: (orderId) => axiosClient.get(`/impact/orders/${orderId}`),
  buyerSummary: () => axiosClient.get('/impact/buyer/summary'),
  platformSummary: () => axiosClient.get('/impact/platform/summary'),
};
