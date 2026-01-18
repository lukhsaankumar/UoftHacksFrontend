import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://uofthacks-hhcs.onrender.com';

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

export interface ProductsResponse {
  success: boolean;
  products: Product[];
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
  description?: string;
  body_html?: string;
  vendor: string;
  product_type?: string;
  tags?: string[];
  images?: string[];
  status?: string;
}

export interface ReplaceProductData {
  productIdToReplace: number;
  productTitle: string;
  newProduct: NewProduct;
  reason: string;
  trendSource?: string;
  confidenceScore: number;
}

export interface PriceChangeData {
  productId: number;
  variantId: number;
  productTitle: string;
  currentPrice: number;
  newPrice: number | string;
  reason: string;
  trendSource?: string;
  confidenceScore: number;
}

export interface NewProductData {
  product: {
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    tags: string[];
    status: string;
  };
  reason: string;
  confidenceScore: number;
}

export interface DescriptionChangeData {
  productId: number;
  productTitle: string;
  currentDescription: string;
  newDescription: string;
  reason: string;
  confidenceScore: number;
}

export type SuggestionType = 'replace-product' | 'price-change' | 'new-product' | 'description-change';

export interface Suggestion {
  _id: string;
  type: SuggestionType;
  data: ReplaceProductData | PriceChangeData | NewProductData | DescriptionChangeData;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: Suggestion[];
}

// API Functions

export const getTrends = async (): Promise<TrendsResponse> => {
  const response = await api.get('/trends');
  return response.data;
};

export const getMarketingProducts = async (): Promise<MarketingProduct[]> => {
  // This endpoint may need to be implemented on backend
  // For now, try to fetch from API, fallback to empty array
  try {
    const response = await api.get('/marketing');
    return response.data.products || [];
  } catch {
    return [];
  }
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
  const response = await api.get<SuggestionsResponse>('/suggestions');
  return response.data.suggestions;
};

export interface AcceptSuggestionResponse {
  success: boolean;
  suggestion: Suggestion;
  message: string;
  error?: string;
}

export const acceptSuggestion = async (id: string): Promise<AcceptSuggestionResponse> => {
  const response = await api.post<AcceptSuggestionResponse>(`/suggestions/${encodeURIComponent(id)}/accept`);
  return response.data;
};

export interface RejectSuggestionResponse {
  success: boolean;
  suggestion: Suggestion;
  message: string;
}

export const rejectSuggestion = async (id: string): Promise<RejectSuggestionResponse> => {
  const response = await api.post<RejectSuggestionResponse>(`/suggestions/${encodeURIComponent(id)}/reject`);
  return response.data;
};

// Health check
export const healthCheck = async (): Promise<{ success: boolean }> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
