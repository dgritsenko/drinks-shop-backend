import { Module } from '@nestjs/common';
import { AdminDrinksController } from './admin-drinks.controller';
import { DrinksService } from 'src/drinks/drinks.service';

@Module({
  controllers: [AdminDrinksController],
  providers: [DrinksService],
})
export class AdminDrinksModule {}
