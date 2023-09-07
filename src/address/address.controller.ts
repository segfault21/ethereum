import { Controller, Get } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private address: AddressService) {}
  @Get()
  async getAddress() {
    return this.address.getAddress();
  }
}
