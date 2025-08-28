import { Body, ClassSerializerInterceptor, Controller, Get, NotFoundException, Post, Request, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '../user.entity';
import { CreateUserDto } from '../create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from '../login.dto';
import { LoginResponse } from '../login.response';
import { UserService } from '../user/user.service';
import type { AuthRequest } from '../auth.request';
import { Public } from '../decorators/public.decorator';
import { AdminResponse } from '../admin.response';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../role.enum';

// Do not import the AuthGuard of passport, but ours
//import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) { }

    @Post('register')
    @Public()
    async register(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.authService.register(createUserDto);
    }

    @Post('login')
    @Public()
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        const accessToken = await this.authService.login(loginDto.email, loginDto.password);
        return new LoginResponse({ accessToken });
    }

    @Get('profile')
    // Now defined globally
    //@UseGuards(AuthGuard)
    async profile(@Request() request: AuthRequest): Promise<User> {
        const user = await this.userService.findOne(request.user.sub);
        if (user) {
            return user;
        }

        throw new NotFoundException();
    }


    @Get('admin') //  /auth/admin
    @Roles(Role.ADMIN)
    async adminOnly(): Promise<AdminResponse> {
        return new AdminResponse({ message: 'This is for admin only' });
    }
}

