import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '@user/users.controller';
import { UsersServiceMock } from '@user/users.service.mock';

import { UsersService } from './users.service';

describe('Users Controller', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: UsersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
