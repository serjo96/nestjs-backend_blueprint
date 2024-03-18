import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';
import {JWTService} from "~/auth/jwt.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JWTService) {}

  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;

    if (!token) {
      throw new UnauthorizedException('Token is missing.');
    }

    try {
      request.user = this.jwtService.verifyToken(token);
      return true;
    } catch (e) {
      throw new UnauthorizedException('Token is invalid or expired.');
    }
  }
}
