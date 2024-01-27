import { RolesEnum, UserEntity } from '@user/users.entity';
import enumTansform from "~/utils/enumTransform";

export class UserClassResponseDto {
  constructor(object: UserEntity) {
    this.id = object.id;
    this.email = object.email;
    this.roles = enumTansform(object.roles, RolesEnum);
  }
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: string;
}
