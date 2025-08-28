import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../create-user.dto';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService
    ) { }

    public async register(createUserDto: CreateUserDto): Promise<User> {
        const existinUser = await this.userService.findOneByEmail(createUserDto.email);
        if (existinUser) {
            throw new ConflictException('Email already exists');
        }

        const user = await this.userService.createUser(createUserDto);
        // Could return the user, or the user and token, or the token
        return user;
    }

    public async login(email: string, password: string): Promise<string> {
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        if (!(await this.passwordService.verify(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.generateToken(user);
    }

    private generateToken(user: User): string {
        const payload = { sub: user.id, name: user.name, roles: user.roles };
        //here we don't worry about the header, it is handled by the JwtService
        return this.jwtService.sign(payload);
    }

}

