import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, RegisterCustomerResponse } from '@epayco/shared';
import { CustomersService } from './customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterCustomerDto): Promise<ApiResponse<RegisterCustomerResponse>> {
    return this.customersService.registerCustomer(dto);
  }
}
