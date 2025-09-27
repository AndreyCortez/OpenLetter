import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.error("A variável de ambiente VITE_API_BASE_URL não está definida!");
}

const apiClient = axios.create({
  baseURL: baseURL,
});

export default apiClient;