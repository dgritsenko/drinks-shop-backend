import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Делает сервис доступным во всем приложении без лишних импортов
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}