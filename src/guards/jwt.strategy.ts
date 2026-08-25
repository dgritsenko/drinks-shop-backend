import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { Request } from 'express';

const extractAccessJwtFromCookie = (req: Request) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['accessToken'];
    }
    return token;
};

const extractRefreshJwtFromCookie = (req: Request) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['refreshToken'];
    }
    return token;
};

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy,'accessTokenStrategy') {
    constructor(private configService: ConfigService) {
        super({
            
            jwtFromRequest: extractAccessJwtFromCookie,
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
  }

    async validate(payload: any) {
        return { uuid: payload.sub,sessionUuid:payload.sid, email: payload.email, role: payload.role };
    }
}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy,'refreshTokenStrategy') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: extractRefreshJwtFromCookie,
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
        });
  }

    async validate(payload: any) {
        return { uuid: payload.sub, sessionUuid:payload.sid};
    }
}