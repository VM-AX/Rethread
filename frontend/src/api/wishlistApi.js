import axiosClient from './axiosClient';

export const wishlistApi = {
  list: () => axiosClient.get('/wishlist'),
  add: (listingId) => axiosClient.post(`/wishlist/${listingId}`),
  remove: (listingId) => axiosClient.delete(`/wishlist/${listingId}`),
};
