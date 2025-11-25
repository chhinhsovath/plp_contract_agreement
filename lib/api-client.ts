const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // For server-side rendering, use localhost
  if (typeof window === 'undefined') {
    return `http://localhost:${process.env.PORT || 3000}`;
  }
  // For client-side rendering, use relative path
  return '';
};

export const API_URL = getApiUrl();

const api = async (url: string, options?: RequestInit) => {
  const response = await fetch(`${API_URL}${url}`, options);
  return response;
};

export default api;
