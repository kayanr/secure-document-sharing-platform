import api from './api';

export const shareDocument = async (documentId, recipientEmail) => {
  await api.post(`/api/documents/${documentId}/share`, { recipientEmail });
};

export const getSharedWithMe = async () => {
  const response = await api.get('/api/documents/shared-with-me');
  return response.data;
};

export const getShares = async (documentId) => {
  const response = await api.get(`/api/documents/${documentId}/shares`);
  return response.data;
};

export const revokeShare = async (documentId, recipientId) => {
  await api.delete(`/api/documents/${documentId}/share/${recipientId}`);
};
