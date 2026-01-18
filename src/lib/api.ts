import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Trend {
  id: string;
  name: string;
  platforms: string[];
  keywords: string[];
  target_products: string[];
  color_palette: string[];
  hashtags: string[];
  marketing_angle: string;
  popularity_score: number;
  growth_rate: number;
}

export interface TrendsResponse {
  success: boolean;
  trends: Trend[];
  count: number;
}

export interface MarketingGenerated {
  title: string;
  description: string;
  description_html: string;
  seo_title: string;
  seo_description: string;
  marketing_angle: string;
  suggested_tags: string[];
  color_scheme: string;
  layout_style: string;
  trust_badges: string[];
  show_countdown: boolean;
  social_caption: string;
}

export interface MarketingProduct {
  success: boolean;
  product_id: string;
  trend_name: string;
  original: {
    title: string;
    description: string;
  };
  generated: MarketingGenerated;
  method: string;
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

// Suggestion Types
export interface NewProduct {
  title: string;
  description: string;
  vendor: string;
  product_type: string;
  tags: string[];
  images: string[];
}

export interface ReplaceProductData {
  productIdToReplace: number;
  productTitle: string;
  newProduct: NewProduct;
  reason: string;
  trendSource: string;
  confidenceScore: number;
}

export interface PriceChangeData {
  productId: number;
  variantId: number;
  productTitle: string;
  currentPrice: number;
  newPrice: number;
  reason: string;
  trendSource: string;
  confidenceScore: number;
}

export interface Suggestion {
  _id: string;
  type: 'replace-product' | 'price-change';
  data: ReplaceProductData | PriceChangeData;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const getTrends = async (): Promise<TrendsResponse> => {
  const response = await api.get('/trends/');
  return response.data;
};

export const getMarketingProducts = async (): Promise<MarketingProduct[]> => {
  // For now, load from local sample data
  const response = await import('@/data/sample_marketing.json');
  return response.default as MarketingProduct[];
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

// Suggestions API
export const getSuggestions = async (): Promise<Suggestion[]> => {
  try {
    const response = await api.get('/suggestions');
    return response.data.suggestions;
  } catch {
    // Fallback to local sample data
    const response = await import('@/data/sample_suggestions.json');
    return response.default as Suggestion[];
  }
};

export const acceptSuggestion = async (id: string): Promise<void> => {
  await api.post(`/suggestions/${encodeURIComponent(id)}/accept`);
};

export const rejectSuggestion = async (id: string): Promise<void> => {
  await api.post(`/suggestions/${encodeURIComponent(id)}/reject`);
};

export default api;
