import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Trend {
  id: string;
  title: string;
  description: string;
}

export interface Product {
  id: string;
  title: string;
  handle?: string;
  status?: string;
}

export interface AiProposal {
  auraTitle: string;
  auraDescriptionHtml: string;
  auraBadgeLabel: string;
  auraEnabled: boolean;
}

export interface ProductDetail {
  product: {
    id: string;
    title: string;
    descriptionHtml: string;
  };
  aiProposal: AiProposal | null;
}

export const getTrends = async (): Promise<Trend[]> => {
  const response = await api.get('/trends');
  return response.data.trends;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data.products;
};

export const getProduct = async (id: string): Promise<ProductDetail> => {
  const response = await api.get(`/products/${encodeURIComponent(id)}`);
  return response.data;
};

export const generateAura = async (id: string): Promise<void> => {
  await api.post(`/products/${encodeURIComponent(id)}/generate-aura`);
};

export const applyAura = async (id: string): Promise<void> => {
  await api.post(`/products/${encodeURIComponent(id)}/apply-aura`);
};

export const revertAura = async (id: string): Promise<void> => {
  await api.post(`/products/${encodeURIComponent(id)}/revert-aura`);
};

export default api;
