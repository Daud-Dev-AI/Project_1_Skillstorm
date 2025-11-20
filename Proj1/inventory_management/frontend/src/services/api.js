import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Warehouse API
export const warehouseAPI = {
  getAll: () => api.get('/warehouses'),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (warehouse) => api.post('/warehouses', warehouse),
  update: (id, warehouse) => api.put(`/warehouses/${id}`, warehouse),
  delete: (id) => api.delete(`/warehouses/${id}`),
  search: (name) => api.get('/warehouses/search', { params: { name } }),
};

// Inventory Item API
export const inventoryAPI = {
  getAll: () => api.get('/items'),
  getById: (id) => api.get(`/items/${id}`),
  getByWarehouse: (warehouseId) => api.get(`/items/warehouse/${warehouseId}`),
  create: (item) => api.post('/items', item),
  update: (id, item) => api.put(`/items/${id}`, item),
  delete: (id) => api.delete(`/items/${id}`),
  transfer: (transferRequest) => api.post('/items/transfer', transferRequest),
  search: (searchTerm, warehouseId) =>
    api.get('/items/search', { params: { searchTerm, warehouseId } }),
  getCategories: () => api.get('/items/categories'),
};

export default api;
