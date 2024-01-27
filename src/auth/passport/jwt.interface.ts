import { RolesEnum } from '@user/users.entity';

export interface IJwtPayload {
  id: string;
  email: string;
  roles: RolesEnum;
}

export interface JwtPayload {
  email: string;
}
