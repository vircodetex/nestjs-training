import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { User } from './user.entity';
import { TypedConfigService } from '../config/typed-config.service';
import { AuthConfig } from 'src/config/auth.config';
import { PasswordService } from './password/password.service';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        // The token will be required with each request
        // Async because the configuration is not known at build time, only at runtime
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: TypedConfigService) => ({
                secret: config.get<AuthConfig>('auth')?.jwt.secret,
                signOptions: {
                    expiresIn: config.get<AuthConfig>('auth')?.jwt.expiresIn,
                }
            })
        })
    ],
    providers: [PasswordService, UserService, AuthService, AuthGuard, RolesGuard,
        // we want AuthGuard must be used globally

        // AuthGuard must be run first, before RolesGuard
        // so the order is important here
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ],
    controllers: [AuthController]
})
export class UsersModule { }
