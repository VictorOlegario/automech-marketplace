import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { MechanicProfile } from '../mechanics/entities/mechanic-profile.entity';
import { CustomerProfile } from '../customers/entities/customer-profile.entity';
import { ServiceRequest } from '../service-requests/entities/service-request.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { Review } from '../reviews/entities/review.entity';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import {
  UserRole,
  ServiceCategory,
  ServiceRequestStatus,
  QuoteStatus,
  UrgencyLevel,
  AnalyticsEventType,
} from '../common/enums';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'automech',
  password: process.env.DB_PASSWORD || 'automech_secret',
  database: process.env.DB_NAME || 'automech_db',
  entities: [User, MechanicProfile, CustomerProfile, ServiceRequest, Quote, Review, AnalyticsEvent],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('Password123', 10);

  // --- Create Mechanics ---
  const mechanicsData = [
    {
      email: 'carlos@automech.com',
      fullName: 'Carlos Oliveira',
      phone: '11999001001',
      role: UserRole.MECHANIC,
      latitude: -23.5505,
      longitude: -46.6333,
      city: 'São Paulo',
      state: 'SP',
      address: 'R. Augusta, 200',
      profile: {
        yearsExperience: 12,
        specialties: ['engine', 'brakes', 'transmission'],
        bio: 'Mecânico especialista em motores com 12 anos de experiência. Certificado ASE.',
        serviceRadiusKm: 15,
        minPrice: 80,
        maxPrice: 2000,
        averageRating: 4.8,
        totalReviews: 47,
        completedServices: 156,
        responseTimeAvg: 8,
        acceptanceRate: 92,
        verifiedStatus: true,
        certifications: ['ASE Certified', 'Toyota Specialist'],
        serviceRegion: 'São Paulo - Centro / Zona Sul',
      },
    },
    {
      email: 'ana@automech.com',
      fullName: 'Ana Santos',
      phone: '11999002002',
      role: UserRole.MECHANIC,
      latitude: -23.563,
      longitude: -46.6543,
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1500',
      profile: {
        yearsExperience: 8,
        specialties: ['electrical', 'battery', 'ac'],
        bio: 'Especialista em sistemas elétricos automotivos e ar condicionado.',
        serviceRadiusKm: 20,
        minPrice: 100,
        maxPrice: 1500,
        averageRating: 4.9,
        totalReviews: 83,
        completedServices: 234,
        responseTimeAvg: 5,
        acceptanceRate: 95,
        verifiedStatus: true,
        certifications: ['Bosch Certified Electrician'],
        serviceRegion: 'São Paulo - Zona Sul / Oeste',
      },
    },
    {
      email: 'roberto@automech.com',
      fullName: 'Roberto Lima',
      phone: '11999003003',
      role: UserRole.MECHANIC,
      latitude: -23.5415,
      longitude: -46.629,
      city: 'São Paulo',
      state: 'SP',
      address: 'R. da Consolação, 800',
      profile: {
        yearsExperience: 3,
        specialties: ['tire', 'oil_change', 'general'],
        bio: 'Mecânico geral, troca de pneus e óleo. Atendimento rápido.',
        serviceRadiusKm: 10,
        minPrice: 50,
        maxPrice: 500,
        averageRating: 4.5,
        totalReviews: 22,
        completedServices: 45,
        responseTimeAvg: 12,
        acceptanceRate: 85,
        verifiedStatus: false,
        certifications: [],
        serviceRegion: 'São Paulo - Centro',
      },
    },
    {
      email: 'maria@automech.com',
      fullName: 'Maria Fernandes',
      phone: '11999004004',
      role: UserRole.MECHANIC,
      latitude: -23.57,
      longitude: -46.648,
      city: 'São Paulo',
      state: 'SP',
      address: 'R. Vergueiro, 1200',
      profile: {
        yearsExperience: 15,
        specialties: ['suspension', 'brakes', 'engine', 'transmission'],
        bio: 'Mecânica com 15 anos de experiência. Especialista em suspensão e freios.',
        serviceRadiusKm: 25,
        minPrice: 100,
        maxPrice: 3000,
        averageRating: 4.7,
        totalReviews: 61,
        completedServices: 312,
        responseTimeAvg: 10,
        acceptanceRate: 88,
        verifiedStatus: true,
        certifications: ['Master Mechanic', 'Honda Certified'],
        serviceRegion: 'São Paulo - Zona Sul',
      },
    },
    {
      email: 'joao@automech.com',
      fullName: 'João Pereira',
      phone: '11999005005',
      role: UserRole.MECHANIC,
      latitude: -23.532,
      longitude: -46.625,
      city: 'São Paulo',
      state: 'SP',
      address: 'R. Haddock Lobo, 400',
      profile: {
        yearsExperience: 1,
        specialties: ['oil_change', 'battery'],
        bio: 'Novo na plataforma. Preços acessíveis e atendimento dedicado.',
        serviceRadiusKm: 8,
        minPrice: 40,
        maxPrice: 300,
        averageRating: 0,
        totalReviews: 0,
        completedServices: 2,
        responseTimeAvg: 15,
        acceptanceRate: 100,
        verifiedStatus: false,
        certifications: [],
        serviceRegion: 'São Paulo - Centro',
      },
    },
  ];

  const mechanicUsers: User[] = [];
  const mechanicProfiles: MechanicProfile[] = [];

  for (const mechData of mechanicsData) {
    const user = await dataSource.getRepository(User).save({
      email: mechData.email,
      password: hashedPassword,
      fullName: mechData.fullName,
      phone: mechData.phone,
      role: mechData.role,
      latitude: mechData.latitude,
      longitude: mechData.longitude,
      city: mechData.city,
      state: mechData.state,
      address: mechData.address,
    });
    mechanicUsers.push(user);

    const profile = await dataSource.getRepository(MechanicProfile).save({
      userId: user.id,
      ...mechData.profile,
      latitude: mechData.latitude,
      longitude: mechData.longitude,
    });
    mechanicProfiles.push(profile);
  }

  console.log(`✅ Created ${mechanicUsers.length} mechanics`);

  // --- Create Customers ---
  const customersData = [
    {
      email: 'pedro@example.com',
      fullName: 'Pedro Almeida',
      phone: '11988001001',
      latitude: -23.5489,
      longitude: -46.6388,
      city: 'São Paulo',
      state: 'SP',
      vehicle: { make: 'Toyota', model: 'Corolla', year: 2022, plate: 'ABC-1234', color: 'White' },
    },
    {
      email: 'lucia@example.com',
      fullName: 'Lúcia Mendes',
      phone: '11988002002',
      latitude: -23.559,
      longitude: -46.64,
      city: 'São Paulo',
      state: 'SP',
      vehicle: { make: 'Honda', model: 'Civic', year: 2021, plate: 'DEF-5678', color: 'Silver' },
    },
    {
      email: 'marcos@example.com',
      fullName: 'Marcos Costa',
      phone: '11988003003',
      latitude: -23.54,
      longitude: -46.63,
      city: 'São Paulo',
      state: 'SP',
      vehicle: { make: 'Volkswagen', model: 'Golf', year: 2020, plate: 'GHI-9012', color: 'Black' },
    },
  ];

  const customerUsers: User[] = [];

  for (const custData of customersData) {
    const user = await dataSource.getRepository(User).save({
      email: custData.email,
      password: hashedPassword,
      fullName: custData.fullName,
      phone: custData.phone,
      role: UserRole.CLIENT,
      latitude: custData.latitude,
      longitude: custData.longitude,
      city: custData.city,
      state: custData.state,
    });
    customerUsers.push(user);

    await dataSource.getRepository(CustomerProfile).save({
      userId: user.id,
      vehicleMake: custData.vehicle.make,
      vehicleModel: custData.vehicle.model,
      vehicleYear: custData.vehicle.year,
      vehiclePlate: custData.vehicle.plate,
      vehicleColor: custData.vehicle.color,
    });
  }

  console.log(`✅ Created ${customerUsers.length} customers`);

  // --- Create Service Requests ---
  const serviceRequests = [
    {
      customerId: customerUsers[0].id,
      mechanicId: mechanicUsers[0].id,
      category: ServiceCategory.BATTERY,
      title: 'Bateria descarregou',
      description: 'Meu carro não liga. A bateria parece estar morta.',
      status: ServiceRequestStatus.COMPLETED,
      urgency: UrgencyLevel.HIGH,
      latitude: -23.5489,
      longitude: -46.6388,
      address: 'R. Oscar Freire, 300',
      vehicleInfo: 'Toyota Corolla 2022 - Branco',
      finalPrice: 250,
      acceptedAt: new Date('2024-12-01T10:00:00'),
      startedAt: new Date('2024-12-01T10:30:00'),
      completedAt: new Date('2024-12-01T11:15:00'),
    },
    {
      customerId: customerUsers[1].id,
      mechanicId: mechanicUsers[1].id,
      category: ServiceCategory.ELECTRICAL,
      title: 'Problema elétrico no painel',
      description: 'Luzes do painel piscando e rádio desligando sozinho.',
      status: ServiceRequestStatus.COMPLETED,
      urgency: UrgencyLevel.MEDIUM,
      latitude: -23.559,
      longitude: -46.64,
      address: 'Av. Brasil, 500',
      vehicleInfo: 'Honda Civic 2021 - Prata',
      finalPrice: 380,
      acceptedAt: new Date('2024-12-05T14:00:00'),
      startedAt: new Date('2024-12-05T14:45:00'),
      completedAt: new Date('2024-12-05T16:00:00'),
    },
    {
      customerId: customerUsers[2].id,
      mechanicId: undefined as any,
      category: ServiceCategory.BRAKES,
      title: 'Freio fazendo barulho',
      description: 'O freio está fazendo um barulho de raspagem ao frear.',
      status: ServiceRequestStatus.REQUESTED,
      urgency: UrgencyLevel.MEDIUM,
      latitude: -23.54,
      longitude: -46.63,
      address: 'R. da Consolação, 1000',
      vehicleInfo: 'Volkswagen Golf 2020 - Preto',
    },
    {
      customerId: customerUsers[0].id,
      mechanicId: mechanicUsers[2].id,
      category: ServiceCategory.OIL_CHANGE,
      title: 'Troca de óleo',
      description: 'Preciso trocar o óleo do carro. Já passou 10.000km.',
      status: ServiceRequestStatus.QUOTED,
      urgency: UrgencyLevel.LOW,
      latitude: -23.5489,
      longitude: -46.6388,
      address: 'R. Oscar Freire, 300',
      vehicleInfo: 'Toyota Corolla 2022 - Branco',
    },
  ];

  const savedServiceRequests: ServiceRequest[] = [];
  for (const srData of serviceRequests) {
    const sr = (await dataSource
      .getRepository(ServiceRequest)
      .save(srData as any)) as ServiceRequest;
    savedServiceRequests.push(sr);
  }
  console.log(`✅ Created ${savedServiceRequests.length} service requests`);

  // --- Create Quotes ---
  const quotes = [
    {
      serviceRequestId: savedServiceRequests[0].id,
      mechanicId: mechanicUsers[0].id,
      estimatedPrice: 250,
      description: 'Troca de bateria com peça inclusa.',
      estimatedDurationMinutes: 45,
      status: QuoteStatus.ACCEPTED,
      respondedAt: new Date('2024-12-01T09:55:00'),
    },
    {
      serviceRequestId: savedServiceRequests[1].id,
      mechanicId: mechanicUsers[1].id,
      estimatedPrice: 380,
      description: 'Diagnóstico e reparo do sistema elétrico.',
      estimatedDurationMinutes: 90,
      status: QuoteStatus.ACCEPTED,
      respondedAt: new Date('2024-12-05T13:55:00'),
    },
    {
      serviceRequestId: savedServiceRequests[3].id,
      mechanicId: mechanicUsers[2].id,
      estimatedPrice: 120,
      description: 'Troca de óleo sintético + filtro.',
      estimatedDurationMinutes: 30,
      status: QuoteStatus.PENDING,
    },
    {
      serviceRequestId: savedServiceRequests[3].id,
      mechanicId: mechanicUsers[3].id,
      estimatedPrice: 150,
      description: 'Troca de óleo completa com check-up básico.',
      estimatedDurationMinutes: 45,
      status: QuoteStatus.PENDING,
    },
  ];

  for (const quoteData of quotes) {
    await dataSource.getRepository(Quote).save(quoteData);
  }
  console.log(`✅ Created ${quotes.length} quotes`);

  // --- Create Reviews ---
  const reviews = [
    {
      serviceRequestId: savedServiceRequests[0].id,
      reviewerId: customerUsers[0].id,
      mechanicId: mechanicUsers[0].id,
      score: 5,
      comment: 'Excelente serviço! Rápido, profissional e preço justo. Recomendo!',
      helpfulCount: 12,
    },
    {
      serviceRequestId: savedServiceRequests[1].id,
      reviewerId: customerUsers[1].id,
      mechanicId: mechanicUsers[1].id,
      score: 5,
      comment: 'Ana é incrível! Encontrou o problema elétrico rapidamente. Super recomendo.',
      helpfulCount: 8,
    },
  ];

  for (const reviewData of reviews) {
    await dataSource.getRepository(Review).save(reviewData);
  }
  console.log(`✅ Created ${reviews.length} reviews`);

  // --- Create Analytics Events ---
  const events = [
    {
      eventType: AnalyticsEventType.USER_REGISTERED,
      userId: mechanicUsers[0].id,
      metadata: { role: 'mechanic' },
    },
    {
      eventType: AnalyticsEventType.USER_REGISTERED,
      userId: mechanicUsers[1].id,
      metadata: { role: 'mechanic' },
    },
    {
      eventType: AnalyticsEventType.USER_REGISTERED,
      userId: customerUsers[0].id,
      metadata: { role: 'client' },
    },
    {
      eventType: AnalyticsEventType.USER_REGISTERED,
      userId: customerUsers[1].id,
      metadata: { role: 'client' },
    },
    {
      eventType: AnalyticsEventType.SERVICE_REQUESTED,
      userId: customerUsers[0].id,
      entityId: savedServiceRequests[0].id,
      entityType: 'service_request',
      metadata: { category: 'battery' },
    },
    {
      eventType: AnalyticsEventType.SERVICE_REQUESTED,
      userId: customerUsers[1].id,
      entityId: savedServiceRequests[1].id,
      entityType: 'service_request',
      metadata: { category: 'electrical' },
    },
    {
      eventType: AnalyticsEventType.QUOTE_ACCEPTED,
      userId: customerUsers[0].id,
      entityType: 'quote',
      metadata: { mechanicId: mechanicUsers[0].id, estimatedPrice: 250 },
    },
    {
      eventType: AnalyticsEventType.SERVICE_COMPLETED,
      userId: mechanicUsers[0].id,
      entityId: savedServiceRequests[0].id,
      entityType: 'service_request',
      metadata: { finalPrice: 250, timeToAcceptMinutes: 15, timeToCompleteMinutes: 45 },
    },
    {
      eventType: AnalyticsEventType.SERVICE_COMPLETED,
      userId: mechanicUsers[1].id,
      entityId: savedServiceRequests[1].id,
      entityType: 'service_request',
      metadata: { finalPrice: 380, timeToAcceptMinutes: 10, timeToCompleteMinutes: 75 },
    },
    {
      eventType: AnalyticsEventType.REVIEW_SUBMITTED,
      userId: customerUsers[0].id,
      entityType: 'review',
      metadata: { mechanicId: mechanicUsers[0].id, score: 5 },
    },
    {
      eventType: AnalyticsEventType.MECHANIC_PROFILE_VIEWED,
      userId: customerUsers[2].id,
      entityId: mechanicUsers[0].id,
      entityType: 'mechanic_profile',
    },
    {
      eventType: AnalyticsEventType.MECHANIC_PROFILE_VIEWED,
      userId: customerUsers[2].id,
      entityId: mechanicUsers[1].id,
      entityType: 'mechanic_profile',
    },
  ];

  for (const eventData of events) {
    await dataSource.getRepository(AnalyticsEvent).save(eventData);
  }
  console.log(`✅ Created ${events.length} analytics events`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test accounts (password: Password123):');
  console.log(
    '  Mechanics: carlos@automech.com, ana@automech.com, roberto@automech.com, maria@automech.com, joao@automech.com',
  );
  console.log('  Customers: pedro@example.com, lucia@example.com, marcos@example.com');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
