import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MechanicsService } from '../mechanics/mechanics.service';
import { CustomersService } from '../customers/customers.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, AnalyticsEventType } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mechanicsService: MechanicsService,
    private readonly customersService: CustomersService,
    private readonly analyticsService: AnalyticsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      phone: registerDto.phone,
      role: registerDto.role,
      latitude: registerDto.latitude,
      longitude: registerDto.longitude,
      address: registerDto.address,
      city: registerDto.city,
      state: registerDto.state,
    });

    if (registerDto.role === UserRole.MECHANIC) {
      await this.mechanicsService.createProfile({
        userId: user.id,
        yearsExperience: registerDto.yearsExperience || 0,
        specialties: registerDto.specialties || [],
        bio: registerDto.bio,
        serviceRadiusKm: registerDto.serviceRadiusKm || 10,
        latitude: registerDto.latitude,
        longitude: registerDto.longitude,
      });
    } else {
      await this.customersService.createProfile({
        userId: user.id,
        vehicleMake: registerDto.vehicleMake,
        vehicleModel: registerDto.vehicleModel,
        vehicleYear: registerDto.vehicleYear,
        vehiclePlate: registerDto.vehiclePlate,
      });
    }

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.USER_REGISTERED,
      userId: user.id,
      metadata: { role: registerDto.role },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    const { password, ...userResult } = user;
    return { user: userResult, accessToken: token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.USER_LOGIN,
      userId: user.id,
    });

    const token = this.generateToken(user.id, user.email, user.role);
    const { password, ...userResult } = user;
    return { user: userResult, accessToken: token };
  }

  private generateToken(userId: string, email: string, role: UserRole): string {
    return this.jwtService.sign({ sub: userId, email, role });
  }
}
