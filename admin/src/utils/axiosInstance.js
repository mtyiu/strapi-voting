import axios from 'axios';

const backendURL = process.env.STRAPI_ADMIN_BACKEND_URL || '';
const instance = axios.create({
  baseURL: backendURL.endsWith('/') ? backendURL : `${backendURL}/`,
});

instance.interceptors.request.use(
  async config => {
    config.headers = {
      ...config.headers,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    return config;
  },
  error => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.reload();
    }

    throw error;
  }
);

export default instance;
