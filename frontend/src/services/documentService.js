import api from './api';

export const getDocuments = async () => {
  const response = await api.get('/api/documents');
  return response.data;
};

export const deleteDocument = async (id) => {
  await api.delete(`/api/documents/${id}`);
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
