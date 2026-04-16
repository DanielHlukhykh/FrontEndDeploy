import api from './fetchClient';

// GET /api/posts
// Query params: perPage, startPage, sort, etc.
// Response: { posts: [...] } или массив
export const getAllPosts = (params = {}) =>
  api.get('/posts', params);

// GET /api/posts/:id
export const getPostById = (id) =>
  api.get(`/posts/${id}`);

// POST /api/posts
// Body: { content, imageUrl, award, ... }
// Headers: Authorization required
export const createPost = (data) =>
  api.post('/posts', data);

// PUT /api/posts/:id
// Body: updated fields
// Headers: Authorization required (owner only)
export const updatePost = (id, data) =>
  api.put(`/posts/${id}`, data);

// PATCH /api/posts/:id
// Body: updated fields (e.g. likes)
// Headers: Authorization required (any authenticated user)
export const patchPost = (id, data) =>
  api.patch(`/posts/${id}`, data);

// DELETE /api/posts/:id
// Headers: Authorization required
export const deletePost = (id) =>
  api.delete(`/posts/${id}`);