import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import dataCompare from 'src/utils/dataCompare';
import { access } from 'fs';
import { JwtService } from '@nestjs/jwt';
import { UserSessionService } from 'src/user-session/user-session.service';
import { UUID, uuidv7 } from 'uuidv7';

interface TokenData {
    uuid:string,
    sessionUuid:string, 
    email:string,
    role:string
}

@Injectable()
export class AuthService{

    constructor(
        private userService: UserService,
        private userSessionService: UserSessionService,
        private jwtService: JwtService
    ) {}

    async me(uuid:string){

        const userData = await this.userService.getUser({
            uuid
        },{
            uuid:true,
            name:true,
            email:true,
            phoneNumber:true,
            role:true,
            createdAt:true,
        })

        const exparedSessions = await this.userSessionService.cleareExparedSessions(uuid)

        return userData
    }

    async refresh(uuid:string, sessionUuid:string, refreshToken:string){
        
        const refreshResult = await this.userSessionService.checkRefreshToken(uuid, sessionUuid, refreshToken)
        console.log('тОКЕНЫ ПРОВЕРЕНЫ ВСЁ ОКЕЙ')

        const userData = await this.userService.getUser({uuid},{
            email:true,
            role:true
        })

        const jwtTokens = await this.#generateTokens({
            uuid,
            sessionUuid,
            email:userData.email,
            role:userData.role,
        })

        const updateRefreshToken = await this.userSessionService.updateRefreshToken(sessionUuid,jwtTokens.refreshToken)
        console.log('тОКЕН ОБНОВЛЁН')

        return {jwtTokens}
    }


    async login(loginDto: LoginUserDto){
        const getUserResult = await this.userService.getUser(
            {
                email: loginDto.email
            }
        )

        if(!getUserResult){
            throw new UnauthorizedException('Uncorrect password or email')
        }


        const compareResult = await dataCompare(loginDto.password, getUserResult.password) 

        if(!compareResult){
            throw new UnauthorizedException('Uncorrect password or email')
        }

        const exparedSessions = await this.userSessionService.cleareExparedSessions(getUserResult.uuid)

        const { password, ...result } = getUserResult

        const sessionUuid = uuidv7()

        const jwtTokens = await this.#generateTokens({
            uuid:result.uuid,
            sessionUuid,
            email:result.email,
            role:result.role,
        })

        const newUserSession = this.userSessionService.createUserSession({
            uuid:sessionUuid,
            userUuid: result.uuid,
            refreshToken: jwtTokens.refreshToken,
            ip:loginDto.ip,
            clientType:loginDto.clientType,
            clientDeviceModel:loginDto.clientDeviceModel,
            clientOS:loginDto.clientOS,
            clientApp:loginDto.clientApp
        })

        return {
            result: {
                message: 'Login success',
                user: result
            }, 
            jwtTokens: jwtTokens
        }

    }

    async #generateTokens(tokenData: TokenData):Promise<{
        accessToken:string,
        refreshToken:string,
    }>{
        const accessToken = this.jwtService.sign(
            { 
                sub: tokenData.uuid,
                sid: tokenData.sessionUuid,
                email: tokenData.email, 
                role: tokenData.role 
            },
            { 
                expiresIn: '15m', 
                secret: process.env.JWT_ACCESS_SECRET 
            }
        );

        const refreshToken = this.jwtService.sign(
            { 
                sub: tokenData.uuid,
                sid:tokenData.sessionUuid,
            },
            { 
                expiresIn: '30d', 
                secret: process.env.JWT_REFRESH_SECRET
            }
        );

        return{
            accessToken,
            refreshToken,
        }
    }

    async #updateAccessToken(tokenData:TokenData ){
        const accessToken = this.jwtService.sign(
            { 
                sub: tokenData.uuid,
                sid: tokenData.sessionUuid,
                email: tokenData.email, 
                role: tokenData.role 
            },
            { 
                expiresIn: '15m', 
                secret: process.env.JWT_ACCESS_SECRET 
            }
        );

        return accessToken
    }

    async register(registerDto: RegisterUserDto){

        return this.userService.createUser(
            registerDto
        )
    }

    async logout(sessionUuid:string){
        return this.userSessionService.deleteCurrentUserSession(sessionUuid)
    }
}