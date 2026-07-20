import axiosClient from './axiosClient';

export const dashboardApi = {
  seller: () => axiosClient.get('/seller/dashboard'),
  sellerAnalytics: () => axiosClient.get('/seller/analytics'),
  buyer: () => axiosClient.get('/buyer/dashboard'),
};
