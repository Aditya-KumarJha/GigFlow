const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const config = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
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

