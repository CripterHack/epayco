import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse, RegisterCustomerRequest, RegisterCustomerResponse } from '@epayco/shared';
import { InternalDbService } from '../proxy/internal-db.service';
import { ensureSuccess } from '../../common/utils/internal-response.util';
import { RegisterClientDto } from './dto/register-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly internalDbService: InternalDbService) {}

  async registerClient(dto: RegisterClientDto): Promise<ApiResponse<RegisterCustomerResponse>> {
    const payload: RegisterCustomerRequest = {
      document: dto.document,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
    };

    const response = await this.internalDbService.registerCustomer(payload);
    return ensureSuccess(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
