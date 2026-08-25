import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DrinksBatchService {
    constructor(
        private prisma: PrismaService,
    ) {}

    // async createDrinkTo(createDrinkDto:){

    // }
}