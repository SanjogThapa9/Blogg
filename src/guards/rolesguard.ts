import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly requiredRole: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    console.log('RolesGuard user:', user); 

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    if (user.role !== this.requiredRole) {
      throw new ForbiddenException(`Only ${this.requiredRole} can perform this action`);
    }

    return true;
  }
}
