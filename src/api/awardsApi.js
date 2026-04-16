import api from './fetchClient';

// GET /api/awards
// Query params: perPage, startPage, sort, etc.
export const getAllAwards = (params = {}) =>
  api.get('/awards', params);

// GET /api/awards/:id
export const getAwardById = (id) =>
  api.get(`/awards/${id}`);

// POST /api/awards
// Body: { title, description, targetValue, currentValue, unit, imageUrl, ... }
// Headers: Authorization required
export const createAward = (data) =>
  api.post('/awards', data);

// PUT /api/awards/:id
// Body: updated fields
// Headers: Authorization required
export const updateAward = (id, data) =>
  api.put(`/awards/${id}`, data);

// DELETE /api/awards/:id
// Headers: Authorization required
export const deleteAward = (id) =>
  api.delete(`/awards/${id}`);