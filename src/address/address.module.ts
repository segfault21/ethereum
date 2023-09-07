import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AddressService } from './address.service';

@Module({
  controllers: [AddressController],
  providers: [PrismaService, AddressService],
})
export class AddressModule {}
