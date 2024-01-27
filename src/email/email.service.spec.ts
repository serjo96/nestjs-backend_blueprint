import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from './email.service';
import { EmailServiceMock } from './email.service.mock';

describe('EmailService', () => {
  let service: EmailService;

  const EmailServiceProvider = {
    provide: EmailService,
    useClass: EmailServiceMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailServiceProvider],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
