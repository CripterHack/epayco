import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { RegisterClientDto } from './dto/register-client.dto';
import {
  RegisterClientResponseDto,
  RegisterClientDataDto,
} from './dto/register-client-response.dto';
import { ApiErrorResponseDto } from '../../common/swagger/api-response.dto';

@Controller('clients')
@ApiTags('Clients')
@ApiExtraModels(RegisterClientResponseDto, RegisterClientDataDto, ApiErrorResponseDto)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new client and create an associated wallet.' })
  @ApiBody({
    type: RegisterClientDto,
    examples: {
      default: {
        value: {
          document: '1234567890',
          fullName: 'Ada Lovelace',
          email: 'ada@example.com',
          phone: '3001234567',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: RegisterClientResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  register(@Body() dto: RegisterClientDto): Promise<RegisterClientResponseDto> {
    return this.clientsService.registerClient(dto) as Promise<RegisterClientResponseDto>;
  }
}
