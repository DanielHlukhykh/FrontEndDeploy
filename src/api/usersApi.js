import api from './fetchClient';
import { getCustomer } from './authApi';

// Утилита — извлечь ID из элемента followers (может быть строкой или объектом)
const getId = (item) => (typeof item === 'string' ? item : item?._id || item?.id || item);

// GET /api/users — получить всех юзеров
export const getAllUsers = () =>
  api.get('/users');

// GET /api/users/:id — получить юзера по id
export const getUserById = (id) =>
  api.get(`/users/${id}`);

// Подписаться на пользователя
// Берём свежие данные, проверяем дубликаты, отправляем массив строковых ID
export const followUser = async (targetId) => {
  const me = await getCustomer();
  const currentIds = (me.followers || []).map(getId);
  if (currentIds.includes(targetId)) return me;
  return api.put('/users/customer', {
    followers: [...currentIds, targetId],
  });
};

// Отписаться от пользователя
export const unfollowUser = async (targetId) => {
  const me = await getCustomer();
  const currentIds = (me.followers || []).map(getId);
  return api.put('/users/customer', {
    followers: currentIds.filter((id) => id !== targetId),
  });
};