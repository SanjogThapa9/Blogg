import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Inside JWT AuthGuard canActivate - validating token');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log('JWT validation failed:', err?.message || info?.message);
      throw new UnauthorizedException('Invalid or expired token. Please login again.');
    }
    return user;
  }
}
