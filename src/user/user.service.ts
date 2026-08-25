import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import dataHasher from 'src/utils/dataHasher';
import { ConfigService } from '@nestjs/config';
import { uuidv7 } from 'uuidv7';
import { Prisma, User } from '@prisma/client';


type GetUserWhere =
    | { uuid: string; email?: never }
    | { email: string; uuid?: never };

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService, 
        private configService: ConfigService
    ) {}


    async createUser(createDto:CreateUserDto){
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createDto.email }
        });

        if(!existingUser){
            throw new NotFoundException('User with this email already exists');
        }

        const saltRounds = Number(this.configService.get('SALT_ROUNDS_SECRET'))
        const hashedPassword = await dataHasher(createDto.password, saltRounds)
        
        try{
            const newUser = await this.prisma.user.create({
                data: {
                    uuid:uuidv7(),
                    name: createDto.name,
                    email: createDto.email,
                    password: hashedPassword,
                    phoneNumber: createDto.phoneNumber,
                    role: createDto.role || 'USER', 
                },

                select: {
                    uuid: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    role: true,

                    createdAt:true,
                    updatedAt:true,

                }
            });

            console.log('User create success')

            return {
                message: 'User registered successfully',
                user: newUser,
            };
        } catch (error) {
            throw new InternalServerErrorException('Error creating user');
        }

    }

    editUser(){

    }

    
    async getUser<S extends Prisma.UserSelect>(
        userData: GetUserWhere, 
        selectData: S
    ): Promise<Prisma.UserGetPayload<{ select: S }>>;

    async getUser(
        userData: GetUserWhere
    ): Promise<User>;

    // Основная реализация метода
    async getUser<S extends Prisma.UserSelect>(
        userData: GetUserWhere, 
        selectData?: S
    ): Promise< any > {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: userData,
                select: selectData
            });        

            if (!existingUser) {
                throw new ConflictException('User with this uuid does not exist');
            }

            return existingUser
            
        } catch (error) {
            throw new InternalServerErrorException('Error getting user');
        }
    }

  

    async deleteUser(uuid: string) {
        try{
            const deletedUser = this.prisma.user.delete({
                where: { uuid },
            });

            return {
                message: 'User delete successfully'
            };
        }catch{
            throw new InternalServerErrorException('Error deleting user');
        }
    }

}
