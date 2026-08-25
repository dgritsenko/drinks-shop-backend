import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSessionService } from 'src/user-session/user-session.service';

@Module({
  providers: [UserService,UserSessionService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
