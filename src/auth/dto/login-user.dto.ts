// src/auth/dto/register-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginUserDto {
    
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password!: string;

    ip!:string;
    clientType!:string
    clientDeviceModel!:string
    clientOS!:string
    clientApp!: string
}
