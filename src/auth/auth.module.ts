import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from 'src/guards/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserSessionService } from 'src/user-session/user-session.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-super-secret-key-change-me-in-env',
      signOptions: { expiresIn: '1d' }, // Токен живет 1 день
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    UserSessionService,
    JwtAccessTokenStrategy, 
    JwtRefreshTokenStrategy // <-- Обязательно добавляем сюда!
  ],
})

export class AuthModule {}
