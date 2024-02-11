// types/express/index.d.ts
import { UserEntity } from 'src/users/users.entity';

declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
  }
}
