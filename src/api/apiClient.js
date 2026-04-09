import { http } from "./http";

// SUPPLIES
export const suppliesApi = {
  list: () => http.get("/api/supplies").then(r => r.data),
  create: (data) => http.post("/api/supplies", data).then(r => r.data),
  update: (id, data) => http.put(`/api/supplies/${id}`, data).then(r => r.data),
  delete: (id) => http.delete(`/api/supplies/${id}`),
};

// CLIENTS
export const clientsApi = {
  list: () => http.get("/api/clients").then(r => r.data),
  create: (data) => http.post("/api/clients", data).then(r => r.data),
  update: (id, data) => http.put(`/api/clients/${id}`, data).then(r => r.data),
  delete: (id) => http.delete(`/api/clients/${id}`),
};

// PRODUCTS
export const productsApi = {
  list: () => http.get("/api/products").then(r => r.data),
  create: (data) => http.post("/api/products", data).then(r => r.data),
  update: (id, data) => http.put(`/api/products/${id}`, data).then(r => r.data),
  delete: (id) => http.delete(`/api/products/${id}`),
};

// MOVEMENTS
export const movementsApi = {
  list: (sort = "-movementDate", limit, startDate, endDate) =>
    http.get("/api/movements", { params: { sort, limit, startDate, endDate } }).then(r => r.data),
  create: (data) => http.post("/api/movements", data).then(r => r.data),
  createBatch: (data) => http.post("/api/movements/batch", data).then(r => r.data),
  delete: (id) => http.delete(`/api/movements/${id}`),
};

// PRODUCTIONS
export const productionsApi = {
  list: (sort = "-production_date", limit) =>
    http.get("/api/productions", { params: { sort, limit } }).then(r => r.data),
  create: (data) => http.post("/api/productions", data).then(r => r.data),
  delete: (id) => http.delete(`/api/productions/${id}`),
};

// ORDERS
export const ordersApi = {
  list: () => http.get("/api/orders").then(r => r.data),
  get: (id) => http.get(`/api/orders/${id}`).then(r => r.data),
  create: (data) => http.post("/api/orders", data).then(r => r.data),
  update: (id, data) => http.put(`/api/orders/${id}`, data).then(r => r.data),
  delete: (id) => http.delete(`/api/orders/${id}`),
  produce: (id) => http.post(`/api/orders/${id}/produce`).then(r => r.data),
  deliver: (id) => http.post(`/api/orders/${id}/deliver`).then(r => r.data),
};
