import api from './fetchClient';

// POST /api/users/login
// Body: { loginOrEmail, password }
// Response: { success: true, token: "Bearer ..." }
export const loginUser = (loginOrEmail, password) =>
  api.post('/users/login', { loginOrEmail, password });

// POST /api/users/register
// Body: { firstName, lastName, login, email, password, ... }
// Response: created user object
export const registerUser = (data) =>
  api.post('/users/register', data);

// GET /api/users/customer
// Headers: Authorization: Bearer <token>
// Response: user object
export const getCustomer = () =>
  api.get('/users/customer');

// PUT /api/users/customer
// Headers: Authorization: Bearer <token>
// Body: updated fields
// Response: updated user object
export const updateCustomer = (data) =>
  api.put('/users/customer', data);

// PUT /api/users/password
// Headers: Authorization: Bearer <token>
// Body: { password, newPassword }
export const changePassword = (data) =>
  api.put('/users/password', data);