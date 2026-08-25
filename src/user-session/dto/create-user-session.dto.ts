// src/user/dto/create-user.dto.ts
import { IsString } from 'class-validator';

export class CreateUserSessionDto {
  @IsString()
  uuid!:string
  userUuid!: string;

  refreshToken!: string;

  ip!:string;
  clientType!:string
  clientDeviceModel!:string
  clientOS!:string
  clientApp!: string
}