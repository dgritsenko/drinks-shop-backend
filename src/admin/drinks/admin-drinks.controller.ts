import { Controller, Get, Post } from '@nestjs/common';
import { DrinksService } from '../../drinks/drinks.service';

@Controller('drinks')
export class AdminDrinksController {
    constructor(private readonly drinksService: DrinksService) {}

    @Get()
    getDrink(){
        console.log('Получить напиток!')
    }  
  

    @Post()
    addDrink(){
        console.log('Добавить напиток!')
    }  
}
