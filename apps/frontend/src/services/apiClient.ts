import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
  } as Record<string, string>,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      return Promise.reject(error);
    }

    return Promise.reject(
      new AxiosError(
        'No fue posible comunicarse con el servidor. Intenta nuevamente.',
        error.code,
        error.config,
        error.request,
      ),
    );
  },
);

export default apiClient;
