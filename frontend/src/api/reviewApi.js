import axiosClient from './axiosClient';

export const reviewApi = {
  create: (data) => axiosClient.post('/reviews', data),
  forListing: (listingId) => axiosClient.get(`/reviews/listing/${listingId}`),
  forUser: (userId) => axiosClient.get(`/reviews/user/${userId}`),
  remove: (id) => axiosClient.delete(`/reviews/${id}`),
};
