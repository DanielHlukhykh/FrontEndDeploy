const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('fittrack_token');

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: token } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !isFormData) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('fittrack_token');
    localStorage.removeItem('fittrack_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  }

  if (!response.ok) {
    const error = new Error(
      (typeof data === 'object' && data?.message) || `HTTP ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const api = {
  get(endpoint, params = {}) {
    const filteredParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        filteredParams[key] = value;
      }
    }
    const query = new URLSearchParams(filteredParams).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return request(url, { method: 'GET' });
  },

  post(endpoint, body) {
    return request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return request(endpoint, { method: 'PUT', body });
  },

  patch(endpoint, body) {
    return request(endpoint, { method: 'PATCH', body });
  },

  delete(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  },
};

export default api;