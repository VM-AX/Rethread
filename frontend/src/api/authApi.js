import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  getMe: () => axiosClient.get('/auth/me'),
  updateMe: (data) => axiosClient.put('/auth/me', data),
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
};
