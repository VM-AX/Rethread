import axiosClient from './axiosClient';

export const searchApi = {
  search: (params) => axiosClient.get('/search/listings', { params }),
  categories: () => axiosClient.get('/search/categories'),
  brands: () => axiosClient.get('/search/brands'),
  suggestions: (keyword) => axiosClient.get('/search/suggestions', { params: { keyword } }),
  trending: () => axiosClient.get('/search/trending'),
};
