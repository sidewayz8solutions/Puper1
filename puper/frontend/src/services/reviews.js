import api from './api';

export const getReviews = async (restroomId) => {
  const response = await api.get(`/restrooms/${restroomId}/reviews`);
  return response.data;
};

export const submitReview = async (restroomId, formData) => {
  const response = await api.post(`/restrooms/${restroomId}/reviews`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateReview = async (reviewId, data) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const markHelpful = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data;
};
