import { http } from "./http";

// SUPPLIES
export const suppliesApi = {
  list: () => http.get("/api/supplies").then(r => r.data),
  create: (data) => http.post("/api/supplies", data).then(r => r.data),
  update: (id, data) => http.put(`/api/supplies/${id}`, data).then(r => r.data),
  delete: (id) => http.delete(`/api/supplies/${id}`),
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
  list: (sort = "-movement_date", limit) =>
    http.get("/api/movements", { params: { sort, limit } }).then(r => r.data),
  create: (data) => http.post("/api/movements", data).then(r => r.data),
  delete: (id) => http.delete(`/api/movements/${id}`),
};

// PRODUCTIONS
export const productionsApi = {
  list: (sort = "-production_date", limit) =>
    http.get("/api/productions", { params: { sort, limit } }).then(r => r.data),
  create: (data) => http.post("/api/productions", data).then(r => r.data),
  delete: (id) => http.delete(`/api/productions/${id}`),
};
