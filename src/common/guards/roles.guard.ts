import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesEnum } from '@user/users.entity';

import getEnumKeyByEnumValue from '../../utils/enum-format';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const hasRole = () => {
      return !!roles.find((item) => {
        return item.toUpperCase() === getEnumKeyByEnumValue(RolesEnum, user.roles);
      });
    };

    if(user && user.roles && hasRole()) {
      return true;
    }
    throw new ForbiddenException(`User dont have permissions for this route.`)
  }
}
