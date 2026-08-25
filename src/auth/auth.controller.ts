import { Body, Controller, Get, Headers, Post, Query, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import type { Response } from 'express'; 
import type { Request } from 'express'; 
import { UAParser } from 'ua-parser-js';
import { ParseClientContextInterceptor } from 'src/parse-client-context/parse-client-context.interceptor';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtRefreshTokenGuard } from 'src/guards/jwt-refresh-token.guard';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('/me')
    @UseGuards(JwtAccessTokenGuard)
    async me(@Req() req: Request){
        
        if(!req.user?.uuid){
            throw new UnauthorizedException()
        }

        const userData = await this.authService.me(req.user.uuid)
        return userData
    }

    @Get('/refresh')
    @UseGuards(JwtRefreshTokenGuard)
    async refresh(
        @Req() req: Request, 
        @Res({ passthrough: true }) res: Response
    ){
        if(!req.user?.uuid || !req.user?.sessionUuid){
            throw new UnauthorizedException()
        }

        const rawRefreshToken = req.cookies?.['refreshToken'];
        const {jwtTokens} = await this.authService.refresh(req.user.uuid, req.user.sessionUuid, rawRefreshToken)

        res.cookie('accessToken', jwtTokens.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path:'/'
        });
        
        res.cookie('refreshToken', jwtTokens.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path:'/'
        });
        return {message:'refresh success'}
    }

    @Post('/login')
    @UseInterceptors(ParseClientContextInterceptor)
    async login(
        @Headers('user-agent') userAgent: string,

        @Headers('Client-Type') clientType: string,
        @Headers('Client-Device') clientDevice: string,
        @Headers('Client-Device-Model') clientDeviceModel: string,
        @Headers('Client-OS') clientOS: string,
        @Headers('Client-Application') clientApplication: string,

        @Body() loginDto:LoginUserDto,
        @Req() req: Request, 
        @Res({ passthrough: true }) res: Response
    ){        
        const {result, jwtTokens} = await this.authService.login(loginDto)
        
        res.cookie('accessToken', jwtTokens.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path:'/'
        });
        
        res.cookie('refreshToken', jwtTokens.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path:'/'
        });


        return result
    }

    @Post('/register')
    async register(@Body() registerDto: RegisterUserDto) {
        return this.authService.register(registerDto);
    }


    @Get('/logout')
    @UseGuards(JwtAccessTokenGuard)
    async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {

        if(!req.user?.uuid ){
            throw new UnauthorizedException()
        }
        if(req.user?.sessionUuid){
            console.log('Имеется id сессии')
            await this.authService.logout(req.user?.sessionUuid)
        }
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');
        return { message: 'Успешный выход' };
    }



    // @UseInterceptors(ParseClientContextInterceptor)
    // @Get('/test')
    // async test(
    //     // @Query('clientContext', ParseClientContextPipe) clientContext: ClientContext,
    //     @Req() req: Request,
    //     @Body() body: Body,
    // ){
    //     console.log('Привет: ',body)
    //     // const ip = req.ip
    //     // const userAgent = UAParser(userAgentHeaders)||'';

    //     // if (typeof userAgent == 'string'){
    //     //     return{ip, device:'АНОНИМНАЯ СВОЛОЧЬ'}
    //     // }

    //     // const sessionDevice = userAgent.device
    //     // const sessionProgramm = userAgent.browser

    //     // console.log(`ip: ${ip}`)
    //     // console.log(`device: ${userAgent}`)

    //     // return {ip,userAgent,sessionDevice,sessionProgramm}
    //     // return {...clientContext,proverka:'goida'}
    //     return {body}
    // }
}