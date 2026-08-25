import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminDrinksModule } from './drinks/admin-drinks.module';
import { AdminDrinksController } from './drinks/admin-drinks.controller';

@Module({
  controllers: [AdminController,AdminDrinksController],
  providers: [AdminService],
  imports: [AdminDrinksModule],
})
export class AdminModule {}
