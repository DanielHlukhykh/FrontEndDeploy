import api from './fetchClient';

// GET /api/comments
// Query: можно фильтровать по post
export const getAllComments = (params = {}) =>
  api.get('/comments', params);

// GET /api/comments/:id
export const getCommentById = (id) =>
  api.get(`/comments/${id}`);

// POST /api/comments
// Body: { post, content, ... }
// Headers: Authorization required
export const createComment = (data) =>
  api.post('/comments', data);

// PUT /api/comments/:id
// Body: updated fields
// Headers: Authorization required
export const updateComment = (id, data) =>
  api.put(`/comments/${id}`, data);

// DELETE /api/comments/:id
// Headers: Authorization required
export const deleteComment = (id) =>
  api.delete(`/comments/${id}`);