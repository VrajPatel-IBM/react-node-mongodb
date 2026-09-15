async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request to ${url} failed with status ${res.status}`);
  }
  return data;
}

export function fetchCourses({ category, skip = 0, limit = 12 } = {}) {
  const params = new URLSearchParams({ skip, limit });
  if (category) params.set('category', category);
  return request(`/api/courses?${params.toString()}`);
}

export function fetchCourseById(id) {
  return request(`/api/courses/${encodeURIComponent(id)}`);
}

export function searchCourses(query) {
  return request(`/api/courses/search?q=${encodeURIComponent(query)}`);
}

export function fetchCategories() {
  return request('/api/categories');
}

export function loginRequest(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function signupRequest(name, email, mobile, password) {
  return request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, mobile, password }),
  });
}

export function updateProfileRequest(id, fields) {
  return request(`/api/auth/profile/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
}

export function createEnrollment(payload) {
  return request('/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getEnrollmentByNumber(enrollmentNumber) {
  return request(`/api/enrollments/${encodeURIComponent(enrollmentNumber)}`).catch(() => null);
}

export function fetchEnrollmentsForEmail(email) {
  return request(`/api/enrollments?email=${encodeURIComponent(email)}`);
}

export function adminListCourses() {
  return request('/api/admin/courses');
}

export function adminCreateCourse(payload) {
  return request('/api/admin/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function adminDeleteCourse(id) {
  return request(`/api/admin/courses/${id}`, { method: 'DELETE' });
}
