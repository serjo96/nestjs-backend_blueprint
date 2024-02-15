import {UserEntity} from "@user/users.entity";

export class UserWithToken {
  user: UserEntity;
  token: {
    accessToken: string
    refreshToken: string
  };
}
