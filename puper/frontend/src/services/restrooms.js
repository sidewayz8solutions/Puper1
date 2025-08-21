import { restroomService } from './supabase';

export const getNearbyRestrooms = async (lat, lon, filters = {}) => {
  return await restroomService.getNearby(lat, lon, filters.radius || 5000);
};

export const getRestroom = async (id) => {
  return await restroomService.getById(id);
};

export const createRestroom = async (data) => {
  return await restroomService.create(data);
};

export const searchRestrooms = async (query, lat, lon, filters = {}) => {
  return await restroomService.search(query, lat, lon, filters);
};

export const addReview = async (restroomId, reviewData) => {
  return await restroomService.addReview(restroomId, reviewData);
};

export const reportRestroom = async (id, data) => {
  // For now, we'll implement this as adding a review with a report flag
  return await restroomService.addReview(id, {
    ...data,
    rating: 1,
    comment: `REPORT: ${data.reason}`,
    is_report: true
  });
};
