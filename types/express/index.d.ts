import { UserEntity } from 'src/users/users.entity';

declare global {
  namespace Express {
    // tslint:disable-next-line: no-empty-interface
    interface User extends  UserEntity {}
  }
}
