import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  MechanicProfile,
  ServiceRequest,
  Quote,
  ReviewsResponse,
  UserRole,
  ServiceRequestStatus,
} from '../types';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    state?: string;
    yearsExperience?: number;
    specialties?: string[];
    bio?: string;
    serviceRadiusKm?: number;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehiclePlate?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
};

// Users
export const usersApi = {
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await api.put('/users/me', data);
    return res.data;
  },

  updateLocation: async (latitude: number, longitude: number) => {
    const res = await api.put('/users/me/location', { latitude, longitude });
    return res.data;
  },
};

// Mechanics
export const mechanicsApi = {
  findNearby: async (
    latitude: number,
    longitude: number,
    radius?: number,
    sortBy?: 'distance' | 'rating',
  ): Promise<MechanicProfile[]> => {
    const params = { latitude, longitude, radius: radius || 20, sortBy: sortBy || 'distance' };
    const res = await api.get('/mechanics/nearby', { params });
    return res.data;
  },

  getTopRated: async (limit?: number): Promise<MechanicProfile[]> => {
    const res = await api.get('/mechanics/top-rated', { params: { limit } });
    return res.data;
  },

  getProfile: async (userId: string): Promise<MechanicProfile> => {
    const res = await api.get(`/mechanics/profile/${userId}`);
    return res.data;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await api.put('/mechanics/profile', data);
    return res.data;
  },

  toggleAvailability: async (isAvailable: boolean) => {
    const res = await api.put('/mechanics/availability', { isAvailable });
    return res.data;
  },

  updateLocation: async (latitude: number, longitude: number) => {
    const res = await api.put('/mechanics/location', { latitude, longitude });
    return res.data;
  },
};

// Service Requests
export const serviceRequestsApi = {
  create: async (data: {
    category: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    vehicleInfo?: string;
    urgency?: string;
    photos?: string[];
  }): Promise<ServiceRequest> => {
    const res = await api.post('/service-requests', data);
    return res.data;
  },

  getMyRequests: async (): Promise<ServiceRequest[]> => {
    const res = await api.get('/service-requests/my-requests');
    return res.data;
  },

  getMyJobs: async (): Promise<ServiceRequest[]> => {
    const res = await api.get('/service-requests/my-jobs');
    return res.data;
  },

  getAvailable: async (
    latitude: number,
    longitude: number,
    radius?: number,
  ): Promise<ServiceRequest[]> => {
    const res = await api.get('/service-requests/available', {
      params: { latitude, longitude, radius },
    });
    return res.data;
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const res = await api.get(`/service-requests/${id}`);
    return res.data;
  },

  updateStatus: async (
    id: string,
    status: ServiceRequestStatus,
    finalPrice?: number,
    cancellationReason?: string,
  ): Promise<ServiceRequest> => {
    const res = await api.put(`/service-requests/${id}/status`, {
      status,
      finalPrice,
      cancellationReason,
    });
    return res.data;
  },
};

// Quotes
export const quotesApi = {
  create: async (data: {
    serviceRequestId: string;
    estimatedPrice: number;
    description?: string;
    estimatedDurationMinutes?: number;
  }): Promise<Quote> => {
    const res = await api.post('/quotes', data);
    return res.data;
  },

  getByServiceRequest: async (serviceRequestId: string): Promise<Quote[]> => {
    const res = await api.get(`/quotes/service-request/${serviceRequestId}`);
    return res.data;
  },

  getMyQuotes: async (): Promise<Quote[]> => {
    const res = await api.get('/quotes/my-quotes');
    return res.data;
  },

  accept: async (quoteId: string): Promise<Quote> => {
    const res = await api.put(`/quotes/${quoteId}/accept`);
    return res.data;
  },

  reject: async (quoteId: string): Promise<Quote> => {
    const res = await api.put(`/quotes/${quoteId}/reject`);
    return res.data;
  },
};

// Reviews
export const reviewsApi = {
  create: async (data: {
    serviceRequestId: string;
    score: number;
    comment?: string;
  }) => {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  getByMechanic: async (
    mechanicId: string,
    page?: number,
    limit?: number,
    sortBy?: 'recent' | 'helpful',
  ): Promise<ReviewsResponse> => {
    const res = await api.get(`/reviews/mechanic/${mechanicId}`, {
      params: { page, limit, sortBy },
    });
    return res.data;
  },

  report: async (reviewId: string, reason: string) => {
    const res = await api.put(`/reviews/${reviewId}/report`, { reason });
    return res.data;
  },

  markHelpful: async (reviewId: string) => {
    const res = await api.put(`/reviews/${reviewId}/helpful`);
    return res.data;
  },
};

// Geolocation
export const geolocationApi = {
  estimatePrice: async (category: string) => {
    const res = await api.get('/geolocation/estimate-price', { params: { category } });
    return res.data;
  },

  classifyUrgency: async (category: string, description: string) => {
    const res = await api.get('/geolocation/classify-urgency', {
      params: { category, description },
    });
    return res.data;
  },
};

export default api;
