import { ClientsService } from './clients.service';
import { InternalDbService } from '../proxy/internal-db.service';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterCustomerResponse, InternalResponse, ErrorCodes } from '@epayco/shared';

describe('ClientsService', () => {
  let service: ClientsService;
  let internalDbServiceMock: jest.Mocked<InternalDbService>;

  beforeAll(() => {
    internalDbServiceMock = {
      registerCustomer: jest.fn(),
    } as jest.Mocked<Partial<InternalDbService>> as jest.Mocked<InternalDbService>;

    service = new ClientsService(internalDbServiceMock);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerClient', () => {
    const registerClientDto: RegisterClientDto = {
      document: '12345678',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    };

    it('should register client successfully', async () => {
      const mockResponse: InternalResponse<RegisterCustomerResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          customerId: 'customer-id',
        },
      };

      internalDbServiceMock.registerCustomer.mockResolvedValue(mockResponse);

      const result = await service.registerClient(registerClientDto);

      expect(result).toEqual({
        code: ErrorCodes.OK,
        message: 'Success',
        data: mockResponse.data,
      });

      const registerCustomerSpy = jest.spyOn(internalDbServiceMock, 'registerCustomer');
      expect(registerCustomerSpy).toHaveBeenCalledWith({
        document: registerClientDto.document,
        fullName: registerClientDto.fullName,
        email: registerClientDto.email,
        phone: registerClientDto.phone,
      });
    });

    it('should handle internal service failure', async () => {
      const mockResponse: InternalResponse<RegisterCustomerResponse> = {
        code: ErrorCodes.DUPLICATE,
        message: 'Customer with this document already exists',
      };

      internalDbServiceMock.registerCustomer.mockResolvedValue(mockResponse);

      await expect(service.registerClient(registerClientDto)).rejects.toThrow();

      const registerCustomerSpy = jest.spyOn(internalDbServiceMock, 'registerCustomer');
      expect(registerCustomerSpy).toHaveBeenCalledWith({
        document: registerClientDto.document,
        fullName: registerClientDto.fullName,
        email: registerClientDto.email,
        phone: registerClientDto.phone,
      });
    });

    it('should handle service exception', async () => {
      internalDbServiceMock.registerCustomer.mockRejectedValue(new Error('Network error'));

      await expect(service.registerClient(registerClientDto)).rejects.toThrow('Network error');

      const registerCustomerSpy = jest.spyOn(internalDbServiceMock, 'registerCustomer');
      expect(registerCustomerSpy).toHaveBeenCalledWith({
        document: registerClientDto.document,
        fullName: registerClientDto.fullName,
        email: registerClientDto.email,
        phone: registerClientDto.phone,
      });
    });
  });
});
