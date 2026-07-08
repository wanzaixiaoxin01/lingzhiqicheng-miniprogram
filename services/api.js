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

export function createLead(data) {
  return request("/api/public/leads", {
    method: "POST",
    data
  });
}
