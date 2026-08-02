import axios from 'axios';
import { API_VERSION_PREFIX, HTTP_HEADERS } from '@algoapp/shared';

export const apiClient = axios.create({
  baseURL: API_VERSION_PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (!config.headers[HTTP_HEADERS.CORRELATION_ID]) {
    config.headers[HTTP_HEADERS.CORRELATION_ID] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return config;
});
