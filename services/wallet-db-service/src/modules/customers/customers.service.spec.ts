import { HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import { CustomersService } from './customers.service';
import { ErrorCodes } from '@epayco/shared';
import { CustomerRepository } from './customer.repository';
import { CustomerEntity } from './entities/customer.entity';

describe('CustomersService', () => {
  const dataSourceMock = {
    transaction: jest.fn(),
  } as jest.Mocked<Partial<DataSource>>;

  const customerRepositoryMock = {
    findByDocument: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findByDocumentAndPhone: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as jest.Mocked<CustomerRepository>;

  const service = new CustomersService(dataSourceMock as DataSource, customerRepositoryMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza error DUPLICATE cuando el documento ya existe', async () => {
    const mockCustomer: CustomerEntity = {
      id: 'existing-id',
      document: '123456789',
      fullName: 'Usuario Demo',
      email: 'demo@example.com',
      phone: '3000000000',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    customerRepositoryMock.findByDocument.mockResolvedValue(mockCustomer);

    await expect(
      service.registerCustomer({
        document: '123456789',
        fullName: 'Usuario Demo',
        email: 'demo@example.com',
        phone: '3000000000',
      }),
    ).rejects.toBeInstanceOf(ApiErrorException);

    try {
      await service.registerCustomer({
        document: '123456789',
        fullName: 'Usuario Demo',
        email: 'demo@example.com',
        phone: '3000000000',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiErrorException);
      const exception = error as ApiErrorException;
      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.getResponse()).toEqual(
        expect.objectContaining({
          code: ErrorCodes.DUPLICATE,
        }),
      );
    }

    const findByDocumentSpy = jest.spyOn(customerRepositoryMock, 'findByDocument');
    const findByEmailSpy = jest.spyOn(customerRepositoryMock, 'findByEmail');

    expect(findByDocumentSpy).toHaveBeenCalledWith('123456789');
    expect(findByEmailSpy).not.toHaveBeenCalled();
  });
});
