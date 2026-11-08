import { request } from "../utils/request";

export function getHome() {
  return request("/api/public/home");
}

export function getCourses(category) {
  return request(`/api/public/courses${category ? `?category=${encodeURIComponent(category)}` : ""}`);
}

export function getCourse(id) {
  return request(`/api/public/courses/${id}`);
}

export function getCampuses() {
  return request("/api/public/campuses");
}

export function getCampus(id) {
  return request(`/api/public/campuses/${id}`);
}

export function getArticles(type) {
  return request(`/api/public/articles${type ? `?type=${encodeURIComponent(type)}` : ""}`);
}

export function getArticle(id) {
  return request(`/api/public/articles/${id}`);
}

export function getMaterials() {
  return request("/api/public/materials");
}

export function getMaterial(id) {
  return request(`/api/public/materials/${id}`);
}

export function createLead(data) {
  return request("/api/public/leads", {
    method: "POST",
    data
  });
}

export function createParentSession(data) {
  return request("/api/public/parent/session", {
    method: "POST",
    data
  });
}

export function bindParentStudent(data, sessionToken) {
  return request("/api/public/parent/bind", {
    method: "POST",
    data,
    header: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined
  });
}

export function getParentStudents(sessionToken) {
  return request("/api/public/parent/students", {
    header: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined
  });
}
