export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8088/api/v1',
  WS_URL: process.env.REACT_APP_WS_URL || 'http://localhost:8088/api/v1/ws',
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getWsUrl = (endpoint: string): string => {
  return `${API_CONFIG.WS_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};