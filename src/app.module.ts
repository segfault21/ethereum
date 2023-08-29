import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CronService } from './cron/cron.service';
import { AddressService } from './address/address.service';
import { AddressModule } from './address/address.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [AddressModule, ScheduleModule.forRoot(), PrismaModule, CronModule],
  controllers: [AppController],
  providers: [AppService, CronService, AddressService],
})
export class AppModule {}
