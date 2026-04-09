import { Injectable } from '@nestjs/common';

@Injectable()
export class GeolocationService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  /**
   * Estimate urgency level based on problem category and description
   */
  classifyUrgency(category: string, description: string): string {
    const emergencyKeywords = [
      'smoke',
      'fire',
      'stuck',
      'highway',
      'accident',
      'fumaça',
      'fogo',
      'preso',
      'rodovia',
      'acidente',
      'emergência',
    ];
    const highKeywords = [
      'brake',
      'engine',
      'overheat',
      'leak',
      'freio',
      'motor',
      'superaquecimento',
      'vazamento',
      'não liga',
    ];

    const lowerDesc = description.toLowerCase();

    if (emergencyKeywords.some((k) => lowerDesc.includes(k))) {
      return 'emergency';
    }
    if (highKeywords.some((k) => lowerDesc.includes(k)) || category === 'emergency') {
      return 'high';
    }
    if (['battery', 'tire'].includes(category)) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Estimate price based on category and historical data
   */
  estimatePrice(category: string): { min: number; max: number; average: number } {
    const priceRanges: Record<string, { min: number; max: number }> = {
      battery: { min: 150, max: 400 },
      brakes: { min: 200, max: 800 },
      engine: { min: 500, max: 3000 },
      tire: { min: 80, max: 300 },
      electrical: { min: 150, max: 600 },
      transmission: { min: 800, max: 3000 },
      suspension: { min: 300, max: 1200 },
      ac: { min: 200, max: 800 },
      oil_change: { min: 80, max: 250 },
      general: { min: 100, max: 500 },
      emergency: { min: 200, max: 1000 },
      other: { min: 100, max: 500 },
    };

    const range = priceRanges[category] || priceRanges.other;
    return {
      min: range.min,
      max: range.max,
      average: Math.round((range.min + range.max) / 2),
    };
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
