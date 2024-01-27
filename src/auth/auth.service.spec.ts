import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { AuthServiceMock } from './auth.service.mock';

describe('AuthService', () => {
  let service: AuthService;

  const AuthServiceProvider = {
    provide: AuthService,
    useClass: AuthServiceMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthServiceProvider],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
