import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UserSessionModule } from './user-session/user-session.module';
import { AdminModule } from './admin/admin.module';
import { AdminDrinksModule } from './admin/drinks/admin-drinks.module';
import { DrinksModule } from './drinks/drinks.module';


@Module({
    imports: [
        AuthModule, 
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        UserModule,
        UserSessionModule,
        AdminModule,
        AdminDrinksModule,
        DrinksModule,
      ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
