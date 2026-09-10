const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Strip the /api/v1 suffix to get the media server origin
const MEDIA_BASE = API_BASE.replace(/\/api\/v1\/?$/, '');

/**
 * Convert a relative upload path (/uploads/...) to a full URL.
 * Absolute URLs (http/https) are returned unchanged.
 * @param {string} url
 * @returns {string}
 */
export function getMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${MEDIA_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}


let cachedCsrfToken = null;

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function fetchCsrfToken() {
  const cookieToken = getCookie('csrfToken');
  if (cookieToken) {
    cachedCsrfToken = cookieToken;
    return cookieToken;
  }
  try {
    const res = await fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' });
    const data = await res.json();
    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
      return data.csrfToken;
    }
  } catch (err) {
    console.warn('[API] Failed to fetch CSRF token:', err.message);
  }
  return null;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...options.headers };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = cachedCsrfToken || getCookie('csrfToken') || (await fetchCsrfToken());
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error((data && data.message) || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),

  // Public
  getPublicPortfolio: () => request('/public/portfolio'),
  getPublicProject: (slug) => request(`/public/projects/${slug}`),
  submitContact: (data) => request('/public/contact', { method: 'POST', body: data }),

  // Auth
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: { identifier, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

  // Dashboard Stats
  getStats: () => request('/dashboard/stats'),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),
  updateVisualEffects: (data) => request('/settings/visual-effects', { method: 'PATCH', body: data }),
  updateSections: (sections) => request('/settings/sections', { method: 'PATCH', body: { sections } }),

  // Projects & Categories
  getProjects: (params = '') => request(`/projects${params ? `?${params}` : ''}`),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: data }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: data }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  reorderProjects: (items) => request('/projects/reorder', { method: 'PATCH', body: { items } }),

  getProjectCategories: () => request('/projects/categories'),
  createProjectCategory: (data) => request('/projects/categories', { method: 'POST', body: data }),
  updateProjectCategory: (id, data) => request(`/projects/categories/${id}`, { method: 'PUT', body: data }),
  deleteProjectCategory: (id) => request(`/projects/categories/${id}`, { method: 'DELETE' }),

  // Skills & Categories
  getSkills: (params = '') => request(`/skills${params ? `?${params}` : ''}`),
  createSkill: (data) => request('/skills', { method: 'POST', body: data }),
  updateSkill: (id, data) => request(`/skills/${id}`, { method: 'PUT', body: data }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),
  reorderSkills: (items) => request('/skills/reorder', { method: 'PATCH', body: { items } }),

  getSkillCategories: () => request('/skills/categories'),
  createSkillCategory: (data) => request('/skills/categories', { method: 'POST', body: data }),
  updateSkillCategory: (id, data) => request(`/skills/categories/${id}`, { method: 'PUT', body: data }),
  deleteSkillCategory: (id) => request(`/skills/categories/${id}`, { method: 'DELETE' }),

  // Experience
  getExperience: () => request('/experience'),
  createExperience: (data) => request('/experience', { method: 'POST', body: data }),
  updateExperience: (id, data) => request(`/experience/${id}`, { method: 'PUT', body: data }),
  deleteExperience: (id) => request(`/experience/${id}`, { method: 'DELETE' }),
  reorderExperience: (items) => request('/experience/reorder', { method: 'PATCH', body: { items } }),

  // Education
  getEducation: () => request('/education'),
  createEducation: (data) => request('/education', { method: 'POST', body: data }),
  updateEducation: (id, data) => request(`/education/${id}`, { method: 'PUT', body: data }),
  deleteEducation: (id) => request(`/education/${id}`, { method: 'DELETE' }),
  reorderEducation: (items) => request('/education/reorder', { method: 'PATCH', body: { items } }),

  // Certifications
  getCertifications: () => request('/certifications'),
  createCertification: (data) => request('/certifications', { method: 'POST', body: data }),
  updateCertification: (id, data) => request(`/certifications/${id}`, { method: 'PUT', body: data }),
  deleteCertification: (id) => request(`/certifications/${id}`, { method: 'DELETE' }),
  reorderCertifications: (items) => request('/certifications/reorder', { method: 'PATCH', body: { items } }),

  // Social Links
  getSocialLinks: (params = '') => request(`/socials${params ? `?${params}` : ''}`),
  createSocialLink: (data) => request('/socials', { method: 'POST', body: data }),
  updateSocialLink: (id, data) => request(`/socials/${id}`, { method: 'PUT', body: data }),
  deleteSocialLink: (id) => request(`/socials/${id}`, { method: 'DELETE' }),
  reorderSocialLinks: (items) => request('/socials/reorder', { method: 'PATCH', body: { items } }),

  // Media
  getMedia: (params = '') => request(`/media${params ? `?${params}` : ''}`),
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/media/upload', { method: 'POST', body: formData });
  },
  deleteMedia: (id) => request(`/media/${id}`, { method: 'DELETE' }),

  // Messages
  getMessages: (params = '') => request(`/messages${params ? `?${params}` : ''}`),
  markMessageRead: (id, isRead) => request(`/messages/${id}/read`, { method: 'PATCH', body: { isRead } }),
  markAllMessagesRead: () => request('/messages/mark-all-read', { method: 'PATCH' }),
  toggleArchiveMessage: (id) => request(`/messages/${id}/archive`, { method: 'PATCH' }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),

  // AI Services
  getAiStatus: () => request('/ai/status'),
  aiChat: (message, history = []) => request('/ai/chat', { method: 'POST', body: { message, history } }),
  aiMatchJob: (jobDescription) => request('/ai/match-job', { method: 'POST', body: { jobDescription } }),
  aiSummarizeProject: (slug, mode = 'tldr') => request('/ai/summarize-project', { method: 'POST', body: { slug, mode } }),
  aiGenerateCaseStudy: (data) => request('/ai/generate-case-study', { method: 'POST', body: data }),
  aiGenerateReply: (data) => request('/ai/reply-draft', { method: 'POST', body: data }),
  aiPolishText: (data) => request('/ai/polish-text', { method: 'POST', body: data })
};
