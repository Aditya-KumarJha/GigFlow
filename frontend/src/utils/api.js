const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const config = {
    method,
    credentials: "include",
    headers: {
      // default headers; `Content-Type` is intentionally not set here when
      // the body is FormData because the browser will set the correct
      // multipart boundary automatically.
      ...headers,
    },
  };

  if (body !== undefined) {
    // If body is FormData (e.g., file uploads), pass it through directly
    // and DO NOT stringify or set Content-Type. For regular JSON bodies,
    // stringify and set Content-Type header.
    if (body instanceof FormData) {
      config.body = body;
      // Remove any Content-Type header so the browser will add the multipart boundary
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else {
      config.body = typeof body === "string" ? body : JSON.stringify(body);
      config.headers = { 'Content-Type': 'application/json', ...config.headers };
    }
  }

  const fullUrl = `${API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(fullUrl, config);
  } catch (fetchError) {
    const error = new Error("Network error: Unable to connect to server");
    error.response = { status: 0, data: null };
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.response = { status: response.status, data };
    throw error;
  }

  return { status: response.status, data };
}

const api = {
  get: (path, config) => request(path, { method: "GET", ...config }),
  post: (path, body, config) =>
    request(path, { method: "POST", body, ...config }),
  patch: (path, body, config) =>
    request(path, { method: "PATCH", body, ...config }),
  put: (path, body, config) =>
    request(path, { method: "PUT", body, ...config }),
  delete: (path, config) => request(path, { method: "DELETE", ...config }),
};

export default api;

