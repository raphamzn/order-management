import { Test } from '@nestjs/testing';
import { BusinessRuleException } from '../shared/exceptions/domain.exception';
import { TransportTypesRepository } from '../transport-types/transport-types.repository';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;
  const clientsRepo = {
    countAuthorization: jest.fn(),
    create: jest.fn(),
  };
  const transportRepo = {
    findManyByIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsRepository, useValue: clientsRepo },
        { provide: TransportTypesRepository, useValue: transportRepo },
      ],
    }).compile();
    service = moduleRef.get(ClientsService);
  });

  describe('assertTransportAuthorized', () => {
    it('passa quando o transporte está autorizado para o cliente', async () => {
      clientsRepo.countAuthorization.mockResolvedValue(1);
      await expect(
        service.assertTransportAuthorized('client-1', 'transport-1'),
      ).resolves.toBeUndefined();
    });

    it('lança BusinessRuleException quando não está autorizado', async () => {
      clientsRepo.countAuthorization.mockResolvedValue(0);
      await expect(
        service.assertTransportAuthorized('client-1', 'transport-1'),
      ).rejects.toBeInstanceOf(BusinessRuleException);
    });
  });

  describe('create', () => {
    it('recusa criar cliente com tipo de transporte inexistente', async () => {
      transportRepo.findManyByIds.mockResolvedValue([]);
      await expect(
        service.create({
          name: 'Acme',
          authorizedTransportTypeIds: ['nao-existe'],
        }),
      ).rejects.toBeInstanceOf(BusinessRuleException);
      expect(clientsRepo.create).not.toHaveBeenCalled();
    });
  });
});
