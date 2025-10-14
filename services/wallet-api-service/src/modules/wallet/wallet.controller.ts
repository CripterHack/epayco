import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { WalletBalanceQueryDto } from './dto/wallet-balance-query.dto';
import {
  WalletBalanceResponseDto,
  WalletBalanceDataDto,
  WalletTopUpResponseDto,
  WalletTopUpDataDto,
} from './dto/wallet-responses.dto';
import { ApiErrorResponseDto } from '../../common/swagger/api-response.dto';

@Controller('wallet')
@ApiTags('Wallet')
@ApiExtraModels(
  WalletBalanceResponseDto,
  WalletBalanceDataDto,
  WalletTopUpResponseDto,
  WalletTopUpDataDto,
  ApiErrorResponseDto,
)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('topup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Top up wallet balance.' })
  @ApiBody({
    type: TopUpWalletDto,
    examples: {
      default: {
        value: {
          document: '1234567890',
          phone: '3001234567',
          amount: 75.5,
        },
      },
    },
  })
  @ApiOkResponse({ type: WalletTopUpResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  async topUp(@Body() dto: TopUpWalletDto): Promise<WalletTopUpResponseDto> {
    return this.walletService.topUp(dto) as Promise<WalletTopUpResponseDto>;
  }

  @Get('balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get wallet balance.' })
  @ApiQuery({ name: 'document', required: true, example: '1234567890' })
  @ApiQuery({ name: 'phone', required: true, example: '3001234567' })
  @ApiOkResponse({ type: WalletBalanceResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  async balance(@Query() dto: WalletBalanceQueryDto): Promise<WalletBalanceResponseDto> {
    return this.walletService.getBalance(dto) as Promise<WalletBalanceResponseDto>;
  }
}
