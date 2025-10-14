import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiResponse, BalanceQueryResponse, TopUpResponse } from '@epayco/shared';
import { WalletsService } from './wallets.service';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('topup')
  @HttpCode(HttpStatus.OK)
  topUp(@Body() dto: TopUpWalletDto): Promise<ApiResponse<TopUpResponse>> {
    return this.walletsService.topUpWallet(dto);
  }

  @Get('balance')
  @HttpCode(HttpStatus.OK)
  getBalance(@Query() dto: BalanceQueryDto): Promise<ApiResponse<BalanceQueryResponse>> {
    return this.walletsService.getBalance(dto);
  }
}
