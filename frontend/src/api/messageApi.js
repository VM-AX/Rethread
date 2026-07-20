import axiosClient from './axiosClient';

export const messageApi = {
  startConversation: (recipientId, listingId) =>
    axiosClient.post('/messages/conversations', { recipientId, listingId }),
  myConversations: () => axiosClient.get('/messages/conversations'),
  getMessages: (conversationId) => axiosClient.get(`/messages/conversations/${conversationId}/messages`),
  send: (conversationId, text) =>
    axiosClient.post(`/messages/conversations/${conversationId}/messages`, { text }),
  markRead: (conversationId) => axiosClient.patch(`/messages/conversations/${conversationId}/read`),
  report: (conversationId, reason) =>
    axiosClient.post(`/messages/conversations/${conversationId}/report`, { reason }),
};
