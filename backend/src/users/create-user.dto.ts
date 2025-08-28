import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    // At least 1 uppercase
    // At least 1 number
    // At least 1 special character
    @Matches(/[A-Z]/, { message: 'must contain at least 1 uppercase letter' })
    @Matches(/[0-9]/, { message: 'must contain at least 1 number' })
    @Matches(/[^A-Za-z0-9]/, { message: 'must contain at least 1 special character' })
    password: string;
}