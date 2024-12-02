import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, name, username } = signUpDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    return {
      user,
      token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      token,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signOut(userId: number, token: string) {
    try {
      await this.prisma.session.deleteMany({
        where: {
          userId: userId,
          active: true,
        },
      });
      return {
        success: true,
        message: 'Successfully signed out',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('SignOut Error:', error);
      throw new InternalServerErrorException('Failed to sign out');
    }
  }
}
