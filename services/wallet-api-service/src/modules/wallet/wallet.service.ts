import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ApiResponse,
  BalanceQueryParams,
  BalanceQueryResponse,
  TopUpRequest,
  TopUpResponse,
} from '@epayco/shared';
import { InternalDbService } from '../proxy/internal-db.service';
import { ensureSuccess } from '../../common/utils/internal-response.util';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { WalletBalanceQueryDto } from './dto/wallet-balance-query.dto';

@Injectable()
export class WalletService {
  constructor(private readonly internalDbService: InternalDbService) {}

  async topUp(dto: TopUpWalletDto): Promise<ApiResponse<TopUpResponse>> {
    const payload: TopUpRequest = {
      document: dto.document,
      phone: dto.phone,
      amount: dto.amount,
    };

    const response = await this.internalDbService.topUp(payload);
    return ensureSuccess(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async getBalance(dto: WalletBalanceQueryDto): Promise<ApiResponse<BalanceQueryResponse>> {
    const params: BalanceQueryParams = {
      document: dto.document,
      phone: dto.phone,
    };

    const response = await this.internalDbService.getBalance(params);
    return ensureSuccess(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
