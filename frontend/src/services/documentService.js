import api from './api';

export const getDocuments = async () => {
  const response = await api.get('/api/documents');
  return response.data;
};

export const deleteDocument = async (id) => {
  await api.delete(`/api/documents/${id}`);
};

export const downloadDocument = async (id, filename) => {
  const response = await api.get(`/api/documents/${id}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
