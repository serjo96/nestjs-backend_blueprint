import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { UsersServiceMock } from './users.service.mock';

describe('UsersService', () => {
  let service: UsersService;

  const UsersServiceProvider = {
    provide: UsersService,
    useClass: UsersServiceMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersServiceProvider],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
