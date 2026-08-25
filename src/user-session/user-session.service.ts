import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { uuidv7 } from 'uuidv7';
import { existsSync } from 'fs';
import dataHasher from 'src/utils/dataHasher';
import { ConfigService } from '@nestjs/config';
import dataCompare from 'src/utils/dataCompare';

@Injectable()
export class UserSessionService {
        constructor(
            private prisma: PrismaService, 
            private configService: ConfigService,
        ) {}

        async createUserSession(createDto:CreateUserSessionDto){
            try{

                const existingUser = await this.prisma.user.findUnique({
                    where:{uuid: createDto.userUuid}
                })

                if(!existingUser){
                    throw new NotFoundException('User with this uuid does not exist');
                }

                const checkLimitResult = await this.#checkUserSessionLimit(
                    createDto.userUuid
                )

                if(checkLimitResult.limitIsFull){
                    throw new ConflictException('Session limit is full')
                }
                
                const saltRounds = Number(this.configService.get('SALT_ROUNDS_SECRET'))
                const hashedRefreshToken = await dataHasher(createDto.refreshToken, saltRounds)

                const currentDate = new Date()
                let expiresDate = new Date(currentDate)
                expiresDate.setDate(expiresDate.getDay()+30) 

                const newUserSession = await this.prisma.userSession.create({
                    data:{
                        uuid:createDto.uuid,
                        userUuid:createDto.userUuid,
                        refreshToken:hashedRefreshToken,
                        ip:createDto.ip,

                        clientType:createDto.clientType,
                        clientDeviceModel:createDto.clientDeviceModel,
                        clientOS:createDto.clientOS,
                        clientApp:createDto.clientApp,

                        
                        expiresAt:expiresDate,
                        lastActiveAt:currentDate,

                    }
                })

            }catch(error){
                throw error
            }
        }

        async checkRefreshToken(uuid:string, uuidSession:string, refreshToken:string){
            const existingUserSession = await this.prisma.user.findUnique({
                where: { uuid }
            });

            if(!existingUserSession){
                throw new NotFoundException('User already exists');
            }
            
            const userSessionData = await this.prisma.userSession.findUnique({
                where:{uuid:uuidSession},
                select:{refreshToken:true}
            })

            if(!userSessionData){
                throw new NotFoundException('Session already exists')
            }

            const compareResult = await dataCompare(refreshToken, userSessionData.refreshToken)
            
            if(!compareResult){
                throw new InternalServerErrorException('Uncorrect refresh token');
            }
            
            
        }
async updateRefreshToken(uuid: string, refreshToken: string) {
    try {
        const existingUserSession = await this.prisma.userSession.findUnique({
            where: { uuid }
        });

        if (!existingUserSession) {
            throw new NotFoundException('User not found');
        }

        const saltRounds = Number(this.configService.get('SALT_ROUNDS_SECRET'));
        
        const hashedRefreshToken = await dataHasher(refreshToken, saltRounds);
        
        const updateToken = await this.prisma.userSession.update({
            where: { uuid },
            data: {
                refreshToken: hashedRefreshToken,
            }
        });

        return updateToken;

    } catch (error) {
        console.error('Error updating refresh token:', error);
        throw error;
    }
}

        async #checkUserSessionLimit(userUuid:string){
            try {
                const countSession = await this.prisma.userSession.count({
                    where:{userUuid}
                })

                if(countSession>=15){
                    return {
                        limitIsFull:true,
                        count:countSession,
                    }
                }

                return {
                    limitIsFull:false,
                    count:countSession,
                }

            }catch(error){
                throw new InternalServerErrorException('Error check count session');
            }
        }

        async getAllUserSession(userUuid:string){
            try{

                const existingUser = await this.prisma.user.findUnique({
                    where: { uuid:userUuid }
                });

                if(!existingUser){
                    throw new NotFoundException('User already exists');
                }

                const allUserSession = this.prisma.userSession.findMany({
                    where:{
                        userUuid
                    },
                    select:{
                        uuid:true,
                        ip:true,
                        clientType:true,
                        clientDeviceModel:true,
                        clientOS:true,
                        clientApp:true,
                        lastActiveAt:true,
                        createdAt:true,
                    }
                })

                return allUserSession

            }catch(error){
                throw new InternalServerErrorException('Error get all user session');
            }
        }

        async deleteCurrentUserSession(uuid:string){

            const allUserSession = this.prisma.userSession.delete({
                where:{
                    uuid
                }
            })

            return allUserSession

        }

        async deleteAllUserSession(userUuid:string){

            const existingUser = await this.prisma.user.findUnique({
                where: { uuid:userUuid }
            });

            if(!existingUser){
                throw new NotFoundException('User already exists');
            }

            const allUserSession = this.prisma.userSession.deleteMany({
                where:{
                    userUuid
                }
            })

            return allUserSession


        }

        async cleareExparedSessions(userUuid:string){
            const existingUser = await this.prisma.user.findUnique({
                where: { uuid:userUuid }
            });

            if(!existingUser){
                throw new NotFoundException('User already exists');
            }

            const exparedSessions = await this.prisma.userSession.deleteMany(
                {where:{
                    uuid:userUuid, 
                    expiresAt: {
                        lt: new Date()
                    }
                }}
            )

            console.log('Истёкшие сессии: ', exparedSessions)

            return exparedSessions

        }

}