import { UserClassResponseDto } from '../dto/user.dto';

export class UserWithToken {
  user: UserClassResponseDto;
  token: {
    accessToken: string
    refreshToken: string
  };
}
