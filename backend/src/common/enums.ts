export enum UserRole {
  CLIENT = 'client',
  MECHANIC = 'mechanic',
  ADMIN = 'admin',
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

export enum AnalyticsEventType {
  SERVICE_REQUESTED = 'service_requested',
  QUOTE_SENT = 'quote_sent',
  QUOTE_ACCEPTED = 'quote_accepted',
  QUOTE_REJECTED = 'quote_rejected',
  SERVICE_ACCEPTED = 'service_accepted',
  SERVICE_STARTED = 'service_started',
  SERVICE_COMPLETED = 'service_completed',
  SERVICE_CANCELLED = 'service_cancelled',
  MECHANIC_PROFILE_VIEWED = 'mechanic_profile_viewed',
  REVIEW_SUBMITTED = 'review_submitted',
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
}
