import request from 'supertest';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { InternalDbService } from '../src/modules/proxy/internal-db.service';
import type { AppConfig } from '../src/config/configuration';
import {
  ApiResponse,
  BalanceQueryResponse,
  ErrorCodes,
  PaymentConfirmResponse,
  PaymentInitResponse,
  RegisterCustomerResponse,
  TopUpResponse,
} from '@epayco/shared';

describe('Wallet API (e2e)', () => {
  let app: INestApplication;
  let apiPrefix: string;

  const internalDbServiceMock = {
    registerCustomer: jest.fn(),
    topUp: jest.fn(),
    initPayment: jest.fn(),
    confirmPayment: jest.fn(),
    getBalance: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(InternalDbService)
      .useValue(internalDbServiceMock)
      .compile();

    app = moduleRef.createNestApplication();

    const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);
    const appConfig = configService.get('app', { infer: true });
    apiPrefix = `/${appConfig.apiPrefix}`;

    app.setGlobalPrefix(appConfig.apiPrefix);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidUnknownValues: true,
        validationError: { target: false },
      }),
    );

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /clients/register', () => {
    it('returns 201 with customer data on success', async () => {
      const requestPayload = {
        document: ' 1234567890 ',
        fullName: ' Ada Lovelace ',
        email: ' ada@example.com ',
        phone: ' 3001234567 ',
      };
      const expectedForwardPayload = {
        document: '1234567890',
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '3001234567',
      };
      const serviceResponse: ApiResponse<RegisterCustomerResponse> = {
        code: ErrorCodes.OK,
        message: 'Cliente registrado',
        data: { customerId: 'cust-123' },
      };
      internalDbServiceMock.registerCustomer.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/clients/register`)
        .send(requestPayload)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(serviceResponse);
      expect(internalDbServiceMock.registerCustomer).toHaveBeenCalledWith(expectedForwardPayload);
    });

    it('returns 409 when duplicate client is reported by the internal service', async () => {
      const requestPayload = {
        document: '1234567890',
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '3001234567',
      };
      const serviceResponse: ApiResponse<RegisterCustomerResponse> = {
        code: ErrorCodes.DUPLICATE,
        message: 'El cliente ya existe',
      };
      internalDbServiceMock.registerCustomer.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/clients/register`)
        .send(requestPayload)
        .expect(HttpStatus.CONFLICT);

      expect(response.body).toEqual({
        code: serviceResponse.code,
        message: serviceResponse.message,
      });
      expect(internalDbServiceMock.registerCustomer).toHaveBeenCalledWith(requestPayload);
    });
  });

  describe('POST /wallet/topup', () => {
    it('returns 200 with updated balance on success', async () => {
      const requestPayload = {
        document: '1234567890',
        phone: '3001234567',
        amount: '50000',
      };
      const forwardedPayload = {
        document: '1234567890',
        phone: '3001234567',
        amount: 50000,
      };
      const serviceResponse: ApiResponse<TopUpResponse> = {
        code: ErrorCodes.OK,
        message: 'Recarga aplicada',
        data: { balance: 150000 },
      };
      internalDbServiceMock.topUp.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/wallet/topup`)
        .send(requestPayload)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(serviceResponse);
      expect(internalDbServiceMock.topUp).toHaveBeenCalledWith(forwardedPayload);
    });

    it('returns 400 when validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/wallet/topup`)
        .send({ document: '123', phone: '3001234567', amount: -10 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'document must be longer than or equal to 5 characters',
          'amount must be a positive number',
        ]),
      );
      expect(internalDbServiceMock.topUp).not.toHaveBeenCalled();
    });
  });

  describe('POST /payments/init', () => {
    it('returns 201 with session data on success', async () => {
      const requestPayload = {
        document: '1234567890',
        phone: '3001234567',
        amount: '49.99',
      };
      const forwardedPayload = {
        document: '1234567890',
        phone: '3001234567',
        amount: 49.99,
      };
      const serviceResponse: ApiResponse<PaymentInitResponse> = {
        code: ErrorCodes.OK,
        message: 'Sesión creada',
        data: {
          sessionId: '0d0fb38e-9f85-42cf-87e0-123456789abc',
          expiresAt: '2024-01-01T00:05:00.000Z',
        },
      };
      internalDbServiceMock.initPayment.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/payments/init`)
        .send(requestPayload)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(serviceResponse);
      expect(internalDbServiceMock.initPayment).toHaveBeenCalledWith(forwardedPayload);
    });

    it('returns mapped error when internal service reports an issue', async () => {
      const requestPayload = {
        document: '1234567890',
        phone: '3001234567',
        amount: 80,
      };
      const serviceResponse: ApiResponse<PaymentInitResponse> = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Cliente no encontrado',
      };
      internalDbServiceMock.initPayment.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/payments/init`)
        .send(requestPayload)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual({
        code: serviceResponse.code,
        message: serviceResponse.message,
      });
      expect(internalDbServiceMock.initPayment).toHaveBeenCalledWith(requestPayload);
    });
  });

  describe('POST /payments/confirm', () => {
    it('returns 200 with remaining balance on success', async () => {
      const requestPayload = {
        sessionId: '0d0fb38e-9f85-42cf-87e0-123456789abc',
        token6: '123456',
      };
      const serviceResponse: ApiResponse<PaymentConfirmResponse> = {
        code: ErrorCodes.OK,
        message: 'Pago confirmado',
        data: { balance: 70000 },
      };
      internalDbServiceMock.confirmPayment.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/payments/confirm`)
        .send(requestPayload)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(serviceResponse);
      expect(internalDbServiceMock.confirmPayment).toHaveBeenCalledWith(requestPayload);
    });

    it('returns 401 when token validation fails', async () => {
      const requestPayload = {
        sessionId: '0d0fb38e-9f85-42cf-87e0-123456789abc',
        token6: '000000',
      };
      const serviceResponse: ApiResponse<PaymentConfirmResponse> = {
        code: ErrorCodes.TOKEN_INVALID,
        message: 'Token inválido',
      };
      internalDbServiceMock.confirmPayment.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .post(`${apiPrefix}/payments/confirm`)
        .send(requestPayload)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toEqual({
        code: serviceResponse.code,
        message: serviceResponse.message,
      });
      expect(internalDbServiceMock.confirmPayment).toHaveBeenCalledWith(requestPayload);
    });
  });

  describe('GET /wallet/balance', () => {
    it('returns 200 with wallet balance', async () => {
      const query = {
        document: '1234567890',
        phone: '3001234567',
      };
      const serviceResponse: ApiResponse<BalanceQueryResponse> = {
        code: ErrorCodes.OK,
        message: 'Saldo consultado',
        data: { balance: 150000 },
      };
      internalDbServiceMock.getBalance.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .get(`${apiPrefix}/wallet/balance`)
        .query(query)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(serviceResponse);
      expect(internalDbServiceMock.getBalance).toHaveBeenCalledWith(query);
    });

    it('returns 404 when wallet is not found', async () => {
      const query = {
        document: '9999999999',
        phone: '3991234567',
      };
      const serviceResponse: ApiResponse<BalanceQueryResponse> = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Wallet no encontrada',
      };
      internalDbServiceMock.getBalance.mockResolvedValueOnce(serviceResponse);

      const response = await request(app.getHttpServer())
        .get(`${apiPrefix}/wallet/balance`)
        .query(query)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual({
        code: serviceResponse.code,
        message: serviceResponse.message,
      });
      expect(internalDbServiceMock.getBalance).toHaveBeenCalledWith(query);
    });
  });
});
