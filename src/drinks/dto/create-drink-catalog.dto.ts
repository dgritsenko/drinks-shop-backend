import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreateDrinkCatalogDto {
  @IsString()
  GTIN!:string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  series!: string;
  
  @IsString()
  @MinLength(1)
  brand!: string;
  
  @IsString()
  @MinLength(1)
  description!: string;
  
  @IsString()
  @MinLength(1)
  manufacturer!: string;
  
  @IsNumber()
  volume!:number

  @IsNumber()
  price!:number

}