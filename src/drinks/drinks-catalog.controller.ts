import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDrinkCatalogDto } from './dto/create-drink-catalog.dto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class DrinksCatalogService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async createDrinkToCatalog(createDrinkDto:CreateDrinkCatalogDto){
        const existingDrinkCatalog = await this.prisma.drinkCatalog.findUnique({
            where: { GTIN: createDrinkDto.GTIN }
        });

        if(!existingDrinkCatalog){
            throw new NotFoundException('Drink with this GTIN already exists');
        }

        const createdDrinkCatalog = await this.prisma.drinkCatalog.create({
            data:{
                uuid : uuidv7(),
                GTIN: createDrinkDto.GTIN,

                name: createDrinkDto.name,
                series:createDrinkDto.series,
                brand:createDrinkDto.brand,
                description:createDrinkDto.description,
                manufacturer:createDrinkDto.manufacturer,
    
                volume: createDrinkDto.volume,
                price: createDrinkDto.price,

            }
        })

        return createdDrinkCatalog
    }

    async createDrinkToCatalogMany(createDrinkDto:CreateDrinkCatalogDto[]){


        const createdDrinkCatalog = await this.prisma.drinkCatalog.createMany({
            data:[]
        })

        return createdDrinkCatalog
    }

    async deleteDrinkToCatalog(uuid:string){

        const deleteDrinkCatalog = await this.prisma.drinkCatalog.delete({
            where:{uuid}
        })

        return deleteDrinkCatalog

    }

}