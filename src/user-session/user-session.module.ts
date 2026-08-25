import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
// import { UserSessionController } from './user-session.controller';

@Module({
  providers: [UserSessionService],
  exports:[UserSessionService],
  // controllers: [UserSessionController]
})
export class UserSessionModule {}
