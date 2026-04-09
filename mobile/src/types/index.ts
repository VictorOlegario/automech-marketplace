export enum UserRole {
  CLIENT = 'client',
  MECHANIC = 'mechanic',
}

export enum ServiceRequestStatus {
  REQUESTED = 'requested',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  IN_TRANSIT = 'in_transit',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum QuoteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum ServiceCategory {
  BATTERY = 'battery',
  BRAKES = 'brakes',
  ENGINE = 'engine',
  TIRE = 'tire',
  ELECTRICAL = 'electrical',
  TRANSMISSION = 'transmission',
  SUSPENSION = 'suspension',
  AC = 'ac',
  OIL_CHANGE = 'oil_change',
  GENERAL = 'general',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  profilePhotoUrl?: string;
  role: UserRole;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  createdAt: string;
}

export interface MechanicProfile {
  id: string;
  userId: string;
  user: User;
  averageRating: number;
  totalReviews: number;
  completedServices: number;
  yearsExperience: number;
  responseTimeAvg: number;
  acceptanceRate: number;
  verifiedStatus: boolean;
  specialties?: string[];
  certifications?: string[];
  workPhotos?: string[];
  bio?: string;
  serviceRadiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
  serviceRegion?: string;
  platformJoinDate: string;
  isNew?: boolean;
  distanceKm?: number;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehiclePlate?: string;
  vehicleColor?: string;
  totalServicesRequested: number;
  totalServicesCompleted: number;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customer?: User;
  mechanicId?: string;
  mechanic?: User;
  category: ServiceCategory;
  title: string;
  description: string;
  photos?: string[];
  status: ServiceRequestStatus;
  urgency: UrgencyLevel;
  latitude: number;
  longitude: number;
  address?: string;
  vehicleInfo?: string;
  finalPrice?: number;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  quotes?: Quote[];
  reviews?: Review[];
  createdAt: string;
}

export interface Quote {
  id: string;
  serviceRequestId: string;
  serviceRequest?: ServiceRequest;
  mechanicId: string;
  mechanic?: User;
  estimatedPrice: number;
  description?: string;
  estimatedDurationMinutes?: number;
  status: QuoteStatus;
  expiresAt?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  serviceRequestId: string;
  reviewerId: string;
  reviewer?: User;
  mechanicId: string;
  score: number;
  comment?: string;
  isReported: boolean;
  helpfulCount: number;
  reviewDate: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  ratingDistribution: Record<number, number>;
}

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  [ServiceCategory.BATTERY]: 'Bateria',
  [ServiceCategory.BRAKES]: 'Freios',
  [ServiceCategory.ENGINE]: 'Motor',
  [ServiceCategory.TIRE]: 'Pneu',
  [ServiceCategory.ELECTRICAL]: 'Elétrica',
  [ServiceCategory.TRANSMISSION]: 'Câmbio',
  [ServiceCategory.SUSPENSION]: 'Suspensão',
  [ServiceCategory.AC]: 'Ar Condicionado',
  [ServiceCategory.OIL_CHANGE]: 'Troca de Óleo',
  [ServiceCategory.GENERAL]: 'Geral',
  [ServiceCategory.EMERGENCY]: 'Emergência',
  [ServiceCategory.OTHER]: 'Outro',
};

export const SERVICE_CATEGORY_ICONS: Record<ServiceCategory, string> = {
  [ServiceCategory.BATTERY]: '🔋',
  [ServiceCategory.BRAKES]: '🛑',
  [ServiceCategory.ENGINE]: '⚙️',
  [ServiceCategory.TIRE]: '🛞',
  [ServiceCategory.ELECTRICAL]: '⚡',
  [ServiceCategory.TRANSMISSION]: '🔧',
  [ServiceCategory.SUSPENSION]: '🏎️',
  [ServiceCategory.AC]: '❄️',
  [ServiceCategory.OIL_CHANGE]: '🛢️',
  [ServiceCategory.GENERAL]: '🔩',
  [ServiceCategory.EMERGENCY]: '🚨',
  [ServiceCategory.OTHER]: '📋',
};

export const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  [ServiceRequestStatus.REQUESTED]: 'Solicitado',
  [ServiceRequestStatus.QUOTED]: 'Orçamento Recebido',
  [ServiceRequestStatus.ACCEPTED]: 'Aceito',
  [ServiceRequestStatus.IN_TRANSIT]: 'Em Deslocamento',
  [ServiceRequestStatus.IN_PROGRESS]: 'Em Atendimento',
  [ServiceRequestStatus.COMPLETED]: 'Finalizado',
  [ServiceRequestStatus.CANCELLED]: 'Cancelado',
};

export const STATUS_COLORS: Record<ServiceRequestStatus, string> = {
  [ServiceRequestStatus.REQUESTED]: '#F59E0B',
  [ServiceRequestStatus.QUOTED]: '#3B82F6',
  [ServiceRequestStatus.ACCEPTED]: '#10B981',
  [ServiceRequestStatus.IN_TRANSIT]: '#8B5CF6',
  [ServiceRequestStatus.IN_PROGRESS]: '#F97316',
  [ServiceRequestStatus.COMPLETED]: '#22C55E',
  [ServiceRequestStatus.CANCELLED]: '#EF4444',
};
